// components/ReturnForm.js
import React, { useState, useEffect } from "react";
import { useWarehouseProducts } from "./useWarehouseProducts";
import { useWarehouseClients } from "./useWarehouseClients";
import { useWarehouseStock } from "./useWarehouseStock";

export function ReturnForm({ warehouseId, clientId: propClientId }) {
  const [selectedClient, setSelectedClient] = useState(propClientId || "");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { clients, loading: clientsLoading } = useWarehouseClients(warehouseId);
  const { products, loading: productsLoading } = useWarehouseProducts(warehouseId, selectedClient);
  const { processReturn, loading: submitting } = useWarehouseStock();

  // Auto-select first client if not provided
  useEffect(() => {
    if (!selectedClient && clients.length > 0) {
      setSelectedClient(clients[0].id);
    }
  }, [clients, selectedClient]);

  // Reset product and form when client changes
  useEffect(() => {
    setSelectedProduct("");
    setQuantity(1);
    setReason("");
  }, [selectedClient]);

  // Auto-select first product when available
  useEffect(() => {
    if (products.length > 0 && !selectedProduct) {
      setSelectedProduct(products[0].id);
    }
  }, [products]);

  const selectedProductObj = products.find((p) => p.id === selectedProduct);
  const dispatchedQuantity = selectedProductObj?.dispatched_quantity || selectedProductObj?.quantity_out || 0; // Adjust based on your data
  const currentStock = selectedProductObj?.quantity || 0;
  const maxReturnable = dispatchedQuantity; // Typically you can only return what was dispatched

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedClient || !selectedProduct) {
      alert("Please select a client and product.");
      return;
    }

    if (quantity < 1 || quantity > maxReturnable) {
      alert(`Return quantity must be between 1 and ${maxReturnable} (dispatched amount).`);
      return;
    }

    if (!reason.trim()) {
      alert("Please provide a reason for the return.");
      return;
    }

    try {
      await processReturn({
        warehouseId,
        clientId: selectedClient,
        productId: selectedProduct,
        quantity: Number(quantity),
        reason: reason.trim(),
      });

      setSuccessMessage(`Return of ${quantity} unit(s) processed successfully!`);
      setQuantity(1);
      setReason("");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      alert("Return processing failed. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Process Return</h2>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-sm rounded-lg p-6 border">
        {/* Client Selector */}
        <div>
          <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">
            Client <span className="text-red-500">*</span>
          </label>
          {clientsLoading ? (
            <p className="text-gray-500">Loading clients...</p>
          ) : (
            <select
              id="client"
              value={selectedClient}
              onChange={(e) => setSelectedClient(Number(e.target.value))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.client_type === "SELLYTICS_STORE" ? `Store #${c.store_id}` : c.external_name || c.id}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Product Selector */}
        <div>
          <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
            Product <span className="text-red-500">*</span>
          </label>
          {productsLoading ? (
            <p className="text-gray-500">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-gray-500">No products found for this client.</p>
          ) : (
            <select
              id="product"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(Number(e.target.value))}
              required
              disabled={!selectedClient}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a product</option>
              {products
                .filter((p) => (p.dispatched_quantity || 0) > 0) // Only show products with dispatches
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.product_name} {p.sku && `(${p.sku})`} — Dispatched: {p.dispatched_quantity || 0}
                  </option>
                ))}
            </select>
          )}
        </div>

        {/* Stock & Dispatch Info */}
        {selectedProductObj && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-medium text-amber-900">
              Current Warehouse Stock: <span className="font-bold">{currentStock}</span> unit(s)
            </p>
            <p className="text-sm font-medium text-amber-900 mt-1">
              Previously Dispatched: <span className="font-bold">{maxReturnable}</span> unit(s)
            </p>
            <p className="text-xs text-amber-700 mt-2">
              You can return up to {maxReturnable} units of this product.
            </p>
          </div>
        )}

        {/* Quantity */}
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Return Quantity <span className="text-red-500">*</span>
          </label>
          <input
            id="quantity"
            type="number"
            min="1"
            max={maxReturnable}
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.min(maxReturnable, Math.max(1, Number(e.target.value) || 1)))
            }
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {quantity > maxReturnable && (
            <p className="mt-1 text-sm text-red-600">
              Cannot return more than previously dispatched ({maxReturnable}).
            </p>
          )}
        </div>

        {/* Reason */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Return <span className="text-red-500">*</span>
          </label>
          <select
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select a reason</option>
            <option>Damaged in transit</option>
            <option>Defective product</option>
            <option>Wrong item shipped</option>
            <option>Customer changed mind</option>
            <option>Overstock / excess</option>
            <option>Expired or near expiry</option>
            <option>Other</option>
          </select>

          {reason === "Other" && (
            <input
              type="text"
              placeholder="Please specify..."
              value={reason === "Other" ? "" : reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          )}
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={
              submitting ||
              !selectedClient ||
              !selectedProduct ||
              quantity > maxReturnable ||
              !reason.trim()
            }
            className={`w-full py-3 px-4 rounded-md text-white font-medium transition ${
              submitting ||
              !selectedClient ||
              !selectedProduct ||
              quantity > maxReturnable ||
              !reason.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            }`}
          >
            {submitting ? "Processing Return..." : "Process Return"}
          </button>
        </div>
      </form>
    </div>
  );
}