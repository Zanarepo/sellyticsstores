// DispatchForm.jsx - Enhanced Dispatch with Batch Selection (shadcn components replaced with plain HTML/Tailwind)
import React, { useState } from "react";
import {
  ArrowUpRight, 
  Package, 
  Send,
  Loader2,
  Plus,
  FileText,
  Hash,
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
    <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      {/* Compact Header */}
      <div className="p-3 sm:p-4 bg-gradient-to-r from-rose-600 to-pink-600 rounded-t-lg sm:rounded-t-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-semibold flex items-center gap-2 text-white">
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
            Dispatch / Ship Out
          </h2>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-white/20 text-white">
            <Package className="w-3 h-3" />
            {totalItems}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Dispatch Items */}
        <div className="max-h-[350px] sm:max-h-[400px] overflow-y-auto space-y-2">
          {dispatchItems.map((item, index) => {
            const { available } = getProductInfo(item.productId);
            const isOverLimit = item.quantity > available;

            return (
              <div
                key={index}
                className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                {/* Mobile: Stack, Desktop: Grid */}
                <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-3 sm:items-end">
                  {/* Product Select */}
                  <div className="sm:col-span-6 space-y-1">
                    <label className="flex items-center gap-1 text-[10px] sm:text-xs font-medium text-slate-700 dark:text-slate-300">
                      <Package className="w-3 h-3" />
                      Product
                    </label>
                    <div className="relative">
                      <select
                        value={item.productId}
                        onChange={(e) => updateItem(index, "productId", e.target.value)}
                        className="w-full px-3 py-2 pr-8 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                              {inv.product.product_name} ({inv.available_qty})
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="sm:col-span-4 space-y-1">
                    <label className="flex items-center justify-between text-[10px] sm:text-xs font-medium text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        Quantity
                      </span>
                      {item.productId && (
                        <span className="text-slate-400 dark:text-slate-500">Max: {available}</span>
                      )}
                    </label>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => updateItem(index, "quantity", item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="h-8 w-8 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center active:scale-95"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={available}
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                        className={`flex-1 text-center h-8 border rounded-lg text-sm font-semibold bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                          isOverLimit ? "border-rose-500" : "border-slate-300 dark:border-slate-600"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => updateItem(index, "quantity", item.quantity + 1)}
                        disabled={item.quantity >= available}
                        className="h-8 w-8 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {isOverLimit && (
                      <p className="text-[9px] sm:text-[10px] text-rose-500 dark:text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Exceeds available stock
                      </p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <div className="sm:col-span-2 flex sm:justify-end">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="h-8 w-8 rounded-lg text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition flex items-center justify-center active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Item Button - Compact */}
        <button
          type="button"
          onClick={addItem}
          className="w-full py-3 sm:py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-rose-400 dark:hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 font-medium text-xs sm:text-sm active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
            <FileText className="w-3.5 h-3.5" />
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Shipping reference, destination, etc."
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
          />
        </div>

        {/* Submit Button - Compact */}
        <button
          onClick={handleDispatch}
          disabled={
            dispatchItems.length === 0 || 
            isSubmitting || 
            dispatchItems.some(i => !i.productId || i.quantity > getProductInfo(i.productId).available)
          }
          className="w-full h-11 sm:h-12 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm sm:text-base font-semibold rounded-lg transition flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              Dispatch {totalItems} Item{totalItems !== 1 ? 's' : ''}
            </>
          )}
        </button>
      </div>
    </div>
  );
}