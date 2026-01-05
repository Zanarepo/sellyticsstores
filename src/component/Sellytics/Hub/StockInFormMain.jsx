// StockInFormMain.jsx - Unit Cost added to UI (nothing else changed)
import React from "react";
import { Hash, ArrowDownLeft, Loader2, DollarSign } from "lucide-react";

const CONDITION_OPTIONS = [
  { value: "GOOD", label: "Good / New" },
  { value: "OPENED", label: "Opened - Resellable" },
  { value: "MINOR_DEFECT", label: "Minor Defect" },
  { value: "DAMAGED", label: "Damaged" },
  { value: "EXPIRED", label: "Expired" },
];

export default function StockInFormMain({
  products,
  selectedProductId,
  setSelectedProductId,
  quantity,
  setQuantity,
  unitCost,           // ← NEW: added
  setUnitCost,        // ← NEW: added
  condition,
  setCondition,
  notes,
  setNotes,
  scannerActive,
  scanStats,
  selectedProduct,
  isSubmitting,
  handleSubmit,
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200">
      <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-xl">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ArrowDownLeft className="w-5 h-5" />
          Stock In / Receive Goods
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Product Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Select Product <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
          >
            <option value="">Choose a product...</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.product_name} — {product.product_type}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">
              Quantity <span className="text-rose-500">*</span>
            </label>
            {scannerActive && (
              <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                Auto-updating
              </span>
            )}
          </div>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full pl-10 pr-4 py-3 text-lg font-semibold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {scannerActive && (
            <p className="text-sm text-slate-500">
              {selectedProduct?.product_type === "SERIALIZED"
                ? `${scanStats.unique} unique codes scanned`
                : `${scanStats.total} total scans`}
            </p>
          )}
        </div>

        {/* Unit Cost - NEW FIELD */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Unit Cost (per item)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="number"
              min="0"
              step="0.01"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-3 text-lg font-semibold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <p className="text-xs text-slate-500">
            Optional. Leave blank if cost is unknown.
          </p>
          {unitCost > 0 && quantity > 0 && (
            <p className="text-sm font-medium text-emerald-600">
              Total Cost: ${(unitCost * quantity).toFixed(2)}
            </p>
          )}
        </div>

        {/* Condition */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Condition</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {CONDITION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Supplier info, delivery reference, etc."
            rows={3}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!selectedProductId || quantity < 1 || isSubmitting}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-lg font-medium rounded-lg flex items-center justify-center gap-3 transition"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ArrowDownLeft className="w-5 h-5" />
              Stock In {quantity} Unit{quantity !== 1 ? "s" : ""}
            </>
          )}
        </button>
      </div>
    </div>
  );
}