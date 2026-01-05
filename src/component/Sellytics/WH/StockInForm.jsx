// components/StockInForm.js
import React, { useState } from "react";
import { supabase } from '../../../supabaseClient';
import toast from "react-hot-toast";
import { useWarehouseProducts } from "./useWarehouseProducts";
import { useCreateScanSession } from "./useCreateScanSession";
import { useBarcodeScanner } from "./useBarcodeScanner";
import { useSession } from "./useSession";

export function StockInForm({ warehouseId, clientId }) {
  const { userId } = useSession();
  const { products } = useWarehouseProducts(warehouseId, clientId);
  const { createSession } = useCreateScanSession();

  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [sessionId, setSessionId] = useState(null);
  const [useScanner, setUseScanner] = useState(false);

  const { scannedItems, duplicates, scan } = useBarcodeScanner({
    sessionId,
    warehouseId,
    clientId,
    userId,
  });

  const selectedProduct = products.find(p => p.id === Number(selectedProductId));

  const startScanning = async () => {
    const id = await createSession(warehouseId, clientId, userId);
    if (id) {
      setSessionId(id);
      setUseScanner(true);
    }
  };

  const handleStockIn = async () => {
    if (!selectedProductId) {
      toast.error("Select a product");
      return;
    }

    let uniqueIdentifiers = null;
    let finalQuantity = quantity;

    if (useScanner && scannedItems.length > 0) {
      finalQuantity = scannedItems.length;
      if (selectedProduct.product_type === "SERIALIZED") {
        uniqueIdentifiers = scannedItems.map(i => i.scanned_value);
      }
    }

    const { error } = await supabase.from("warehouse_ledger").insert({
      warehouse_id: warehouseId,
      warehouse_product_id: Number(selectedProductId),
      client_id: clientId,
      movement_type: "IN",
      movement_subtype: "STANDARD",
      quantity: finalQuantity,
      notes: useScanner ? "Received via scanning" : "Manual stock in",
      item_condition: "GOOD",
      unique_identifiers: uniqueIdentifiers,
      created_by: userId,
    });

    if (error) {
      toast.error("Stock in failed");
      console.error(error);
    } else {
      toast.success(`Stock in successful: ${finalQuantity} unit(s)`);
      // Reset form
      setQuantity(1);
      setSelectedProductId("");
      setSessionId(null);
      setUseScanner(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-8">Stock In / Receive Goods</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg text-lg"
          >
            <option value="">Select product...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.product_name} ({p.sku || "No SKU"}) - {p.product_type}
              </option>
            ))}
          </select>
        </div>

        {!useScanner && selectedProduct && selectedProduct.product_type !== "SERIALIZED" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
          </div>
        )}

        {selectedProduct && selectedProduct.product_type === "SERIALIZED" && (
          <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
            <p className="font-medium text-amber-900 mb-4">
              This is a serialized product. Use scanner to receive unique items.
            </p>
            {!sessionId ? (
              <button
                onClick={startScanning}
                className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Start Scanning Serials
              </button>
            ) : (
              <div>
                <input
                  type="text"
                  autoFocus
                  placeholder="Scan serial number..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      scan(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="w-full text-2xl text-center py-6 border-4 border-dashed border-amber-400 rounded-lg mb-6"
                />
                <p className="text-center text-2xl font-bold">{scannedItems.length} serials scanned</p>
                {duplicates.length > 0 && (
                  <p className="text-red-600 text-center mt-4">{duplicates.length} duplicates detected</p>
                )}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleStockIn}
          disabled={!selectedProductId || (useScanner && scannedItems.length === 0)}
          className="w-full py-5 bg-green-600 text-white text-xl font-bold rounded-xl hover:bg-green-700 disabled:opacity-50"
        >
          Confirm Stock In
        </button>
      </div>
    </div>
  );
}