// DispatchForm.jsx - Enhanced Dispatch with Batch Selection (shadcn components replaced with plain HTML/Tailwind)
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight, 
  Package, 
  Send,
  Loader2,
  Plus,
  Minus,
  Trash2,
  AlertCircle,
  ChevronDown
} from "lucide-react";
import { useSession } from "./useSession";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";

export default function DispatchForm({ warehouseId, clientId, inventory = [], onSuccess }) {
  const { userId } = useSession();
  const [dispatchItems, setDispatchItems] = useState([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableProducts = inventory.filter(item => item.available_qty > 0);

  const addItem = () => {
    setDispatchItems(prev => [...prev, { productId: "", quantity: 1 }]);
  };

  const updateItem = (index, field, value) => {
    setDispatchItems(prev => {
      const updated = [...prev];
      if (field === "productId") {
        updated[index].productId = value;
        updated[index].quantity = 1;
      } else if (field === "quantity") {
        const inv = availableProducts.find(i => i.product?.id?.toString() === updated[index].productId);
        const maxQty = inv?.available_qty || 1;
        updated[index].quantity = Math.max(1, Math.min(maxQty, parseInt(value) || 1));
      }
      return updated;
    });
  };

  const removeItem = (index) => {
    setDispatchItems(prev => prev.filter((_, i) => i !== index));
  };

  const getProductInfo = (productId) => {
    const inv = availableProducts.find(i => i.product?.id?.toString() === productId);
    return {
      name: inv?.product?.product_name || "Unknown",
      available: inv?.available_qty || 0,
      productType: inv?.product?.product_type || "STANDARD",
      inventoryId: inv?.id
    };
  };

  const handleDispatch = async () => {
    if (dispatchItems.length === 0) {
      toast.error("Add items to dispatch");
      return;
    }

    // Validate all items
    for (const item of dispatchItems) {
      const { available, name } = getProductInfo(item.productId);
      if (!item.productId) {
        toast.error("Select a product for all items");
        return;
      }
      if (item.quantity > available) {
        toast.error(`Insufficient stock for ${name}`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      for (const item of dispatchItems) {
        const { inventoryId } = getProductInfo(item.productId);

        // Create ledger entry
        await supabase.from("warehouse_ledger").insert({
          warehouse_id: warehouseId,
          warehouse_product_id: parseInt(item.productId),
          client_id: clientId,
          movement_type: "OUT",
          movement_subtype: "DISPATCH",
          quantity: item.quantity,
          notes: notes || "Dispatched",
          created_by: userId,
        });

        // Update inventory
        const { data: currentInv } = await supabase
          .from("warehouse_inventory")
          .select("quantity, available_qty")
          .eq("id", inventoryId)
          .single();

        if (currentInv) {
          await supabase
            .from("warehouse_inventory")
            .update({
              quantity: currentInv.quantity - item.quantity,
              available_qty: currentInv.available_qty - item.quantity
            })
            .eq("id", inventoryId);
        }
      }

      const totalQty = dispatchItems.reduce((sum, i) => sum + i.quantity, 0);
      toast.success(`Successfully dispatched ${totalQty} items`);
      
      setDispatchItems([]);
      setNotes("");
      onSuccess?.();

    } catch (error) {
      console.error(error);
      toast.error("Dispatch failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalItems = dispatchItems.reduce((sum, i) => sum + i.quantity, 0);

  if (availableProducts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="py-16 text-center">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-slate-600 mb-2">No Stock Available</h3>
          <p className="text-slate-400">There are no products available for dispatch</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200">
      {/* Header */}
      <div className="p-6 pb-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-t-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5" />
            Dispatch / Ship Out
          </h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20">
            {totalItems} items
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Dispatch Items */}
        <div className="max-h-[400px] overflow-y-auto">
          <div className="space-y-4">
            {dispatchItems.map((item, index) => {
              const { available } = getProductInfo(item.productId);
              const isOverLimit = item.quantity > available;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-slate-50 rounded-xl"
                >
                  <div className="grid grid-cols-12 gap-4 items-end">
                    {/* Product Select */}
                    <div className="col-span-6 space-y-2">
                      <label className="block text-xs font-medium text-slate-700">Product</label>
                      <div className="relative">
                        <select
                          value={item.productId}
                          onChange={(e) => updateItem(index, "productId", e.target.value)}
                          className="w-full px-4 py-2.5 pr-10 border border-slate-300 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        >
                          <option value="" disabled>Select product...</option>
                          {availableProducts.map((inv) => {
                            const disabled = dispatchItems.some(
                              (d, i) => i !== index && d.productId === inv.product.id.toString()
                            );
                            return (
                              <option 
                                key={inv.product.id} 
                                value={inv.product.id.toString()}
                                disabled={disabled}
                                className={disabled ? "text-slate-400" : ""}
                              >
                                {inv.product.product_name} ({inv.available_qty} available)
                              </option>
                            );
                          })}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-4 space-y-2">
                      <label className="block text-xs font-medium text-slate-700 items-center justify-between">
                        <span>Quantity</span>
                        {item.productId && (
                          <span className="text-slate-400">Max: {available}</span>
                        )}
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateItem(index, "quantity", item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="h-9 w-9 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={available}
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", e.target.value)}
                          className={`w-20 text-center h-9 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                            isOverLimit ? "border-rose-500" : "border-slate-300"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => updateItem(index, "quantity", item.quantity + 1)}
                          disabled={item.quantity >= available}
                          className="h-9 w-9 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      {isOverLimit && (
                        <p className="text-xs text-rose-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Exceeds available stock
                        </p>
                      )}
                    </div>

                    {/* Remove */}
                    <div className="col-span-2">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="h-9 w-9 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Add Item Button */}
        <button
          type="button"
          onClick={addItem}
          className="w-full py-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition flex items-center justify-center gap-2 text-slate-600 font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Product to Dispatch
        </button>

        {/* Notes */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Shipping reference, destination, etc."
            rows={2}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleDispatch}
          disabled={dispatchItems.length === 0 || isSubmitting || dispatchItems.some(i => !i.productId || i.quantity > getProductInfo(i.productId).available)}
          className="w-full h-14 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-medium rounded-lg transition flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Dispatch {totalItems} Item{totalItems !== 1 ? "s" : ""}
            </>
          )}
        </button>
      </div>
    </div>
  );
}