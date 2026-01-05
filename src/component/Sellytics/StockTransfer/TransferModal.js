// src/components/stockTransfer/TransferModal.jsx
import { toast } from "react-toastify";
import { supabase } from "../../../supabaseClient";
import { AnimatePresence, motion } from "framer-motion";
import { FaExchangeAlt, FaStore, FaBoxOpen } from "react-icons/fa";
import { X } from "lucide-react";

export default function TransferModal({
  open,
  onClose,
  product,
  stores,
  sourceStoreId,
  destination,
  setDestination,
  qty,
  setQty,
  onSuccess,
  userId,
  ownerId,
}) {
  if (!open || !product) return null;

const submit = async () => {
  const quantity = Number(qty);

  // ---------------- VALIDATION ----------------
  if (!destination) {
    toast.error("Please select a destination store");
    return;
  }
  if (quantity <= 0 || quantity > product.available_qty) {
    toast.error("Invalid quantity or insufficient stock");
    return;
  }
  if (String(destination) === String(sourceStoreId)) {
    toast.error("You cannot transfer to the same store");
    return;
  }

  try {
    const sourceProduct = product.dynamic_product || product;
    const productName = sourceProduct.name || "Product";

    // ---------------- 1. DEDUCT SOURCE ----------------
    const { error: deductError } = await supabase
      .from("dynamic_inventory")
      .update({
        available_qty: product.available_qty - quantity,
        quantity: product.available_qty - quantity,
        updated_at: new Date(),
      })
      .eq("store_id", sourceStoreId)
      .eq("dynamic_product_id", product.dynamic_product_id);
    if (deductError) throw deductError;

    // ---------------- 2. CHECK DESTINATION PRODUCT ----------------
    const { data: destProduct, error: prodErr } = await supabase
      .from("dynamic_product")
      .select("*")
      .eq("store_id", destination)
      .eq("name", productName)
      .maybeSingle();
    if (prodErr) throw prodErr;

    let destProductId;

    // ---------------- 3A. PRODUCT EXISTS → UPDATE INVENTORY + PRODUCT DETAILS ----------------
    if (destProduct) {
      destProductId = destProduct.id;

      // Update the product fields to match the source
      const { error: updateProdErr } = await supabase
        .from("dynamic_product")
        .update({
          description: sourceProduct.description ?? null,
          purchase_price: sourceProduct.purchase_price ?? null,
          markup_percent: sourceProduct.markup_percent ?? null,
          selling_price: sourceProduct.selling_price ?? null,
          suppliers_name: sourceProduct.suppliers_name ?? null,
          device_id: sourceProduct.device_id ?? null,
          dynamic_product_imeis: sourceProduct.dynamic_product_imeis ?? null,
          device_size: sourceProduct.device_size ?? null,
        })
        .eq("id", destProductId);
      if (updateProdErr) throw updateProdErr;

      // Update or create inventory
      const { data: destInventory, error: invErr } = await supabase
        .from("dynamic_inventory")
        .select("available_qty, quantity")
        .eq("store_id", destination)
        .eq("dynamic_product_id", destProductId)
        .maybeSingle();
      if (invErr) throw invErr;

      if (!destInventory) {
        const { error: invCreateErr } = await supabase
          .from("dynamic_inventory")
          .insert({
            dynamic_product_id: destProductId,
            store_id: destination,
            quantity: quantity,
            available_qty: quantity,
            store_owner_id: ownerId,
            last_updated: new Date(),
            updated_at: new Date(),
          });
        if (invCreateErr) throw invCreateErr;
      } else {
        const { error: updateErr } = await supabase
          .from("dynamic_inventory")
          .update({
            available_qty: destInventory.available_qty + quantity,
            quantity: destInventory.quantity + quantity,
            updated_at: new Date(),
          })
          .eq("store_id", destination)
          .eq("dynamic_product_id", destProductId);
        if (updateErr) throw updateErr;
      }
    }

    // ---------------- 3B. PRODUCT DOES NOT EXIST → CREATE PRODUCT + INVENTORY ----------------
    else {
      const { data: newProduct, error: createErr } = await supabase
        .from("dynamic_product")
        .insert({
          store_id: destination,
          name: productName,
          description: sourceProduct.description ?? null,
          purchase_price: sourceProduct.purchase_price ?? null,
          markup_percent: sourceProduct.markup_percent ?? null,
          selling_price: sourceProduct.selling_price ?? null,
          suppliers_name: sourceProduct.suppliers_name ?? null,
          device_id: sourceProduct.device_id ?? null,
          dynamic_product_imeis: sourceProduct.dynamic_product_imeis ?? null,
          device_size: sourceProduct.device_size ?? null,
          owner_id: ownerId,
          created_by_email: userId,
          purchase_qty: quantity,
        })
        .select()
        .single();
      if (createErr) throw createErr;
      destProductId = newProduct.id;

      const { error: invCreateErr } = await supabase
        .from("dynamic_inventory")
        .insert({
          dynamic_product_id: destProductId,
          store_id: destination,
          quantity: quantity,
          available_qty: quantity,
          store_owner_id: ownerId,
          last_updated: new Date(),
          updated_at: new Date(),
        });
      if (invCreateErr) throw invCreateErr;
    }

    // ---------------- 4. LOG TRANSFER ----------------
    const { error: logErr } = await supabase
      .from("stock_transfer_requests")
      .insert({
        source_store_id: sourceStoreId,
        destination_store_id: destination,
        dynamic_product_id: product.dynamic_product_id,
        quantity: quantity,
        store_owner_id: ownerId,
        //requested_by_id: userId,
        status: "APPROVED",
        requested_at: new Date(),
      });
    if (logErr) throw logErr;

    // ---------------- SUCCESS ----------------
    toast.success(`Transferred ${quantity} × ${productName}`);
    onSuccess?.();
    onClose();
    setQty("");
    setDestination("");
  } catch (err) {
    console.error("Transfer failed:", err);
    toast.error(err.message || "Transfer failed");
  }
};



  
return (
  <AnimatePresence>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <FaExchangeAlt className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Transfer Stock
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Move inventory between stores
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Product + Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900/50">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                <FaBoxOpen className="w-4 h-4" />
                Product
              </label>
              <p className="font-semibold text-slate-900 dark:text-white">
                {product.dynamic_product?.name || "Unknown"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900/50">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                <FaStore className="w-4 h-4" />
                From Store
              </label>
              <p className="font-semibold text-slate-900 dark:text-white">
                {stores.find(s => String(s.id) === String(sourceStoreId))?.shop_name || "Unknown"}
              </p>
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Destination Store *
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            >
              <option value="">Select destination</option>
              {stores
                .filter(s => String(s.id) !== String(sourceStoreId))
                .map(s => (
                  <option key={s.id} value={s.id}>
                    {s.shop_name}
                  </option>
                ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Quantity (Available: {product.available_qty})
            </label>
            <input
              type="number"
              min="1"
              max={product.available_qty}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="Enter quantity"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex gap-3 justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={!destination || !qty}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold transition"
          >
            <FaExchangeAlt className="w-4 h-4" />
            Transfer Stock
          </button>
        </div>
      </motion.div>
    </div>
  </AnimatePresence>
);



}  