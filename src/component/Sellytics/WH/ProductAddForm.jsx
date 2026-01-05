import React, { useState } from "react";
import { useProductAddForm } from "./useProductAddForm";
import { BarcodeScanner } from "./BarcodeScanner";
import { useSession } from "./useSession";

export function ProductAddForm({ warehouseId, clientId, onSuccess }) {
  const { userId } = useSession(); // Logged-in user UUID

  const {
    mode,
    setMode,
    form,
    
    setForm,
    quantity,
    setQuantity,
    sessionId,
    startScanSession,
    submit,
    isSubmitting,
  } = useProductAddForm({ warehouseId, clientId, onSuccess });

  // Live scan counts from BarcodeScanner
  const [liveScanCount, setLiveScanCount] = useState({ total: 0, unique: 0 });

  // Calculate suggested quantity based on product type
  const suggestedQuantity = mode === "scan" && sessionId
    ? form.product_type === "SERIALIZED"
      ? liveScanCount.unique
      : liveScanCount.total
    : null;

  // Safe handler – updates quantity only if user hasn't overridden it

  const finalQuantity = quantity > 0 ? quantity : 0;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-900">
        Add New Product
      </h2>

      {/* Mode Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`flex-1 py-4 rounded-xl font-semibold transition ${
            mode === "manual" ? "bg-indigo-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Manual Entry
        </button>
        <button
          type="button"
          onClick={() => setMode("scan")}
          className={`flex-1 py-4 rounded-xl font-semibold transition ${
            mode === "scan" ? "bg-indigo-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Scan Barcodes
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(finalQuantity);
        }}
        className="space-y-6"
      >
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            required
            value={form.product_name}
            onChange={(e) => setForm({ ...form, product_name: e.target.value })}
            placeholder="e.g. iPhone 15 Pro"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* SKU */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SKU (Optional)</label>
          <input
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            placeholder="e.g. IP15PRO-256-BLK"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Product Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
          <select
            value={form.product_type}
            onChange={(e) => setForm({ ...form, product_type: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="STANDARD">Standard (Non-Unique)</option>
            <option value="SERIALIZED">Serialized (Unique Barcode per Unit)</option>
            <option value="BATCH">Batch (Same Barcode for All Units)</option>
          </select>
        </div>

        {/* Quantity – Always Editable + Live Feedback */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            required
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-lg font-semibold"
          />
          {suggestedQuantity !== null && (
            <div className="mt-2 text-sm">
              {suggestedQuantity === quantity ? (
                <span className="text-green-600 font-medium">
                  ✓ Matches scanned items ({suggestedQuantity})
                </span>
              ) : (
                <span className="text-indigo-600">
                  ℹ️ Scanned: {suggestedQuantity} item{suggestedQuantity !== 1 ? "s" : ""} — edit if needed
                </span>
              )}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            You can edit this manually at any time, even during scanning.
          </p>
        </div>

        {/* Full Barcode Scanner */}
        
     {mode === "scan" && (form.product_type === "SERIALIZED" || form.product_type === "BATCH") && (
  <div className="mt-8 -mx-6 sm:-mx-8">
    {sessionId ? (
      <BarcodeScanner
        warehouseId={warehouseId}
        clientId={clientId}
        userId={userId}
        onSessionStart={(id) => console.log("Session started:", id)}
        onScanUpdate={({ total, unique }) => {
          // Live feedback: update quantity automatically if not manually overridden
          const suggested = form.product_type === "SERIALIZED" ? unique : total;
          if (quantity <= 1 || quantity === liveScanCount.total || quantity === liveScanCount.unique) {
            setQuantity(Math.max(1, suggested));
          }
          // Also update local state for display
          setLiveScanCount({ total, unique });
        }}
      />
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-b-2xl">
                <button
                  type="button"
                  onClick={startScanSession}
                  className="px-10 py-6 bg-indigo-600 text-white text-2xl font-bold rounded-2xl hover:bg-indigo-700 shadow-xl transition transform hover:scale-105"
                >
                  Activate Full Scanner
                </button>
                <p className="mt-4 text-gray-600 max-w-md mx-auto">
                  Open the dedicated scanner with live list, stats and duplicate detection.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || finalQuantity < 1}
          className="w-full py-5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-xl font-bold rounded-xl shadow-lg transition transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating Product..." : "Create Product"}
        </button>
      </form>
    </div>
  );
}