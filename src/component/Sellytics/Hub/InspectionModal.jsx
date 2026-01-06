import React from 'react';
import { Eye, Check, X } from 'lucide-react';
import { CONDITIONS, RESOLUTION_OPTIONS } from './returnsConstants';
import LoadingSpinner from './LoadingSpinner';

export default function InspectionModal({
  show,
  onClose,
  selectedReturn,
  inspectionData,
  setInspectionData,
  processing,
  onSubmit,
}) {
  if (!show || !selectedReturn) return null;

  const clientName = selectedReturn.client?.stores?.shop_name || selectedReturn.client?.external_name || 'Unknown';
return (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
    <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
      
      {/* Compact Header */}
      <div className="flex-shrink-0 px-3 py-2.5 sm:px-4 sm:py-3 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            <span>Inspect Return</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5">
        <div className="space-y-4">
          
          {/* Return Info Card */}
          <div className="p-3 sm:p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-sm sm:text-base text-slate-900 mb-2">
              {selectedReturn.product?.product_name}
            </h4>
            
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs sm:text-sm">
              <div className="flex items-baseline gap-1">
                <span className="font-semibold text-slate-700">SKU:</span>
                <span className="text-slate-600">{selectedReturn.product?.sku || 'N/A'}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-semibold text-slate-700">Qty:</span>
                <span className="text-slate-600">{selectedReturn.quantity}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-semibold text-slate-700">Client:</span>
                <span className="text-slate-600 truncate">{clientName}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-semibold text-slate-700">Date:</span>
                <span className="text-slate-600">
                  {new Date(selectedReturn.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {selectedReturn.reason && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-300">
                <p className="text-xs font-semibold text-slate-700 mb-1">Reason:</p>
                <p className="text-xs italic text-slate-600 leading-relaxed">
                  "{selectedReturn.reason}"
                </p>
              </div>
            )}
          </div>

          {/* Condition Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
              Item Condition <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              {CONDITIONS.map(c => (
                <label
                  key={c.value}
                  className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    inspectionData.condition === c.value
                      ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="condition"
                    value={c.value}
                    checked={inspectionData.condition === c.value}
                    onChange={e => setInspectionData(prev => ({ ...prev, condition: e.target.value }))}
                    className="sr-only"
                  />
                  <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex-shrink-0 ${c.classes}`} />
                  <span className="text-xs sm:text-sm font-medium">{c.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Resolution Select */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
              Resolution <span className="text-rose-500">*</span>
            </label>
            <select
              value={inspectionData.newStatus}
              onChange={e => setInspectionData(prev => ({ ...prev, newStatus: e.target.value }))}
              className="w-full px-3 py-2 sm:py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white hover:border-slate-400 transition-colors"
            >
              <option value="">Select a resolution...</option>
              {RESOLUTION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes Textarea */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
              Inspection Notes
            </label>
            <textarea
              value={inspectionData.notes}
              onChange={e => setInspectionData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 sm:py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white hover:border-slate-400 resize-none transition-colors"
              placeholder="Add any relevant inspection notes..."
            />
          </div>
        </div>
      </div>

      {/* Compact Footer */}
      <div className="flex-shrink-0 px-3 py-2.5 sm:px-4 sm:py-3 border-t border-slate-200 bg-slate-50/50 flex flex-col-reverse sm:flex-row justify-end gap-2">
        <button
          onClick={onClose}
          disabled={processing}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg hover:bg-white active:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={processing || !inspectionData.newStatus || !inspectionData.condition}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {processing ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Complete Inspection</span>
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);
}