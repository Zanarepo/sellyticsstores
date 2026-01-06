import React from 'react';
import { ArrowDownLeft, Hash, DollarSign, Loader2, Package, FileText, CheckCircle2 } from 'lucide-react';

const CONDITION_OPTIONS = [
  { value: "GOOD", label: "Good / New" },
  { value: "OPENED", label: "Resellable" },
  { value: "MINOR_DEFECT", label: "Minor Defect" },
  { value: "DAMAGED", label: "Damaged" },
  { value: "EXPIRED", label: "Expired" },
];


export default function StockInForm({
  products = [],
  selectedProductId,
  setSelectedProductId,
  quantity,
  setQuantity,
  unitCost,
  setUnitCost,
  condition,
  setCondition,
  notes,
  setNotes,
  handleSubmit,
  isSubmitting,
  scannerActive = false,
  scanStats = { unique: 0, total: 0 },
  selectedProduct = null,
}) {
  const totalCost = unitCost > 0 && quantity > 0 ? (unitCost * quantity).toFixed(2) : null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      {/* Compact Header */}
      <div className="p-3 sm:p-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-t-lg sm:rounded-t-xl">
        <h2 className="text-sm sm:text-base font-semibold flex items-center gap-2 text-white">
          <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Stock In / Receive Goods
        </h2>
      </div>

      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Product Selection */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
            <Package className="w-3.5 h-3.5" />
            Select Product <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full px-3 py-2 sm:py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              <Hash className="w-3.5 h-3.5" />
              Quantity <span className="text-rose-500">*</span>
            </label>
            {scannerActive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-medium rounded-full border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Auto-updating
              </span>
            )}
          </div>
          <div className="relative">
            <Hash className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 text-base sm:text-lg font-semibold border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {scannerActive && (
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
              {selectedProduct?.product_type === "SERIALIZED"
                ? `${scanStats.unique} unique codes scanned`
                : `${scanStats.total} total scans`}
            </p>
          )}
        </div>

        {/* Unit Cost */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
            <DollarSign className="w-3.5 h-3.5" />
            Unit Cost (per item)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="number"
              min="0"
              step="0.01"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 text-base sm:text-lg font-semibold border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {totalCost ? (
            <div className="flex items-center justify-between p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <span className="text-[10px] sm:text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Total Cost:
              </span>
              <span className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400">
                ${totalCost}
              </span>
            </div>
          ) : (
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
              Optional. Leave blank if cost is unknown.
            </p>
          )}
        </div>

        {/* Condition - Compact Grid */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
            Condition
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CONDITION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCondition(opt.value)}
                className={`
                  px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all
                  ${condition === opt.value
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
            <FileText className="w-3.5 h-3.5" />
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Supplier info, delivery reference, etc."
            rows={3}
            className="w-full px-3 py-2 sm:py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        </div>

        {/* Submit Button - Compact */}
        <button
          onClick={handleSubmit}
          disabled={!selectedProductId || quantity < 1 || isSubmitting}
          className="w-full py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white text-sm sm:text-base font-semibold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              Stock In {quantity} Unit{quantity !== 1 ? 's' : ''}
            </>
          )}
        </button>
      </div>
    </div>
  );
}