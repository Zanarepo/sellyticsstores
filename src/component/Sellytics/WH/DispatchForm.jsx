// components/DispatchForm.js
import React, { useState } from "react";
import { supabase } from '../../../supabaseClient';
import toast from "react-hot-toast";
import { useWarehouseInventory } from "./useWarehouseInventory";
import { useSession } from "./useSession"
export function DispatchForm({ warehouseId, clientId }) {
  const { userId } = useSession();
  const { inventory, loading } = useWarehouseInventory(warehouseId, clientId);

  const [items, setItems] = useState([]); // [{ productId, quantity }]

  const addItem = () => {
    setItems([...items, { productId: "", quantity: 1 }]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = field === "productId" ? Number(value) : Math.max(1, Number(value) || 1);
    setItems(updated);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Helper to get product name and available qty
  const getProductInfo = (productId) => {
    const item = inventory.find(i => i.warehouse_product_id?.id === productId);
    return {
      name: item?.warehouse_product_id?.product_name || "Unknown",
      available: item?.available_qty || 0
    };
  };

  const handleDispatch = async () => {
    // Validation
    for (const item of items) {
      const { available } = getProductInfo(item.productId);
      if (!item.productId || item.quantity > available) {
        toast.error(`Invalid quantity for ${getProductInfo(item.productId).name}`);
        return;
      }
    }

    const ledgerEntries = items.map(item => ({
      warehouse_id: warehouseId,
      warehouse_product_id: item.productId,
      client_id: clientId,
      movement_type: "OUT",
      movement_subtype: "STANDARD",
      quantity: item.quantity,
      notes: "Batch dispatch",
      item_condition: "GOOD",
      created_by: userId,
    }));

    const { error } = await supabase.from("warehouse_ledger").insert(ledgerEntries);

    if (error) {
      toast.error("Dispatch failed: " + error.message);
      console.error(error);
    } else {
      toast.success(`Successfully dispatched ${items.reduce((s, i) => s + i.quantity, 0)} items!`);
      setItems([]);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading available stock...</div>;
  }

  // Only show products with stock
  const productsInStock = inventory.filter(item => item.available_qty > 0);

  if (productsInStock.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-xl">
        <p className="text-xl text-gray-600">No products in stock for dispatch</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-8">Dispatch / Batch Ship</h2>

      <div className="space-y-6">
        {items.map((item, index) => {
          const { available } = getProductInfo(item.productId);
          return (
            <div key={index} className="flex items-end space-x-4 p-6 bg-gray-50 rounded-xl">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                <select
                  value={item.productId}
                  onChange={(e) => updateItem(index, "productId", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a product...</option>
                  {productsInStock.map((inv) => (
                    <option key={inv.warehouse_product_id.id} value={inv.warehouse_product_id.id}>
                      {inv.warehouse_product_id.product_name} — {inv.available_qty} available
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-40">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity (Max: {available})
                </label>
                <input
                  type="number"
                  min="1"
                  max={available}
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={() => removeItem(index)}
                className="px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
              >
                Remove
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={addItem}
          className="w-full py-5 border-2 border-dashed border-indigo-400 rounded-xl text-indigo-600 font-semibold hover:bg-indigo-50 transition"
        >
          + Add Another Product
        </button>

        <button
          onClick={handleDispatch}
          disabled={
            items.length === 0 ||
            items.some(i => !i.productId || i.quantity > getProductInfo(i.productId).available)
          }
          className="w-full py-6 bg-red-600 text-white text-xl font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Confirm Batch Dispatch
        </button>
      </div>
    </div>
  );
}