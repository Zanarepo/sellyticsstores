// components/ProductModal.jsx - Updated labels for edit mode
import React from "react";
import { X, Loader2, ChevronDown } from "lucide-react";

export default function ProductModal({
  show,
  productName,
  setProductName,
  sku,
  setSku,
  productType,
  setProductType,
  unitCost,
  setUnitCost,
  quantity,
  setQuantity,
  damagedQty,
  setDamagedQty,
  processing,
  onClose,
  onSubmit,
  PRODUCT_TYPES,
}) {
  if (!show) return null;

  const currentDesc = PRODUCT_TYPES.find(t => t.value === productType)?.desc || "";

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleCancel = (e) => {
    e.preventDefault();
    onClose();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const isSubmitDisabled = processing || !productName.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={handleBackdropClick}>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-xl font-semibold text-slate-900">Edit Product</h3>
          <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div className="p-6 space-y-5">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                SKU <span className="text-slate-400 text-xs">(optional)</span>
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Unit Cost */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Unit Cost <span className="text-slate-400 text-xs">(leave blank to keep current)</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                placeholder="Current value preserved"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Total Quantity */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Total Quantity <span className="text-slate-400 text-xs">(leave blank to keep current)</span>
              </label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Current stock preserved"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Damaged Quantity */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Damaged Quantity <span className="text-slate-400 text-xs">(leave blank to keep current)</span>
              </label>
              <input
                type="number"
                min="0"
                value={damagedQty}
                onChange={(e) => setDamagedQty(e.target.value)}
                placeholder="Current damaged preserved"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Product Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Type</label>
              <div className="relative">
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-slate-300 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-indigo-500"
                >
                  {PRODUCT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
              <p className="mt-2 text-xs text-slate-500">{currentDesc}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 p-6 pt-0">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-auto order-2 sm:order-1 px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full sm:w-auto order-1 sm:order-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Update Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}