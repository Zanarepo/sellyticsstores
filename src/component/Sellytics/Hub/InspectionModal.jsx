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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold flex items-center gap-3">
              <Eye className="w-6 h-6 text-indigo-600" />
              Inspect Return
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Return Info */}
          <div className="p-4 bg-slate-50 rounded-xl">
            <h4 className="font-semibold text-lg">{selectedReturn.product?.product_name}</h4>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-slate-600">
              <div>
                <span className="font-medium">SKU:</span> {selectedReturn.product?.sku || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Quantity:</span> {selectedReturn.quantity}
              </div>
              <div>
                <span className="font-medium">Client:</span> {clientName}
              </div>
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(selectedReturn.created_at).toLocaleDateString()}
              </div>
            </div>
            {selectedReturn.reason && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-sm font-medium text-slate-700 mb-1">Reason:</p>
                <p className="text-sm italic text-slate-600">"{selectedReturn.reason}"</p>
              </div>
            )}
          </div>

          {/* Condition Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Item Condition <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {CONDITIONS.map(c => (
                <label
                  key={c.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                    inspectionData.condition === c.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
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
                  <div className={`w-4 h-4 rounded-full ${c.classes}`} />
                  <span className="text-sm font-medium">{c.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Resolution */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Resolution <span className="text-rose-500">*</span>
            </label>
            <select
              value={inspectionData.newStatus}
              onChange={e => setInspectionData(prev => ({ ...prev, newStatus: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a resolution...</option>
              {RESOLUTION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Inspection Notes
            </label>
            <textarea
              value={inspectionData.notes}
              onChange={e => setInspectionData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              placeholder="Add any relevant inspection notes..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={processing}
            className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={processing || !inspectionData.newStatus || !inspectionData.condition}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <>
                <LoadingSpinner size="sm" />
                Processing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Complete Inspection
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}