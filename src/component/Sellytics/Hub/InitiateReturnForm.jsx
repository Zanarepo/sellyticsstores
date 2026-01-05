import React from 'react';
import { RotateCcw, X } from 'lucide-react';
import { CREATE_STATUS_OPTIONS } from './returnsConstants';
import LoadingSpinner from './LoadingSpinner';

export default function InitiateReturnForm({
  show,
  onClose,
  clients = [],
  getProductsForClient,
  initiateData,
  setInitiateData,
  processing,
  onSubmit,
}) {
  if (!show) return null;

  const clientProducts = getProductsForClient ? getProductsForClient(initiateData.clientId) || [] : [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <RotateCcw className="w-7 h-7 text-indigo-600" />
              Create Return Request
            </h3>
            <button
              onClick={onClose}
              className="p-3 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Client <span className="text-rose-500">*</span>
                </label>
                <select
                  value={initiateData.clientId}
                  onChange={(e) =>
                    setInitiateData((prev) => ({
                      ...prev,
                      clientId: e.target.value,
                      productId: '',
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a client...</option>
                  {clients.map((c) => {
                    const name = c.stores?.shop_name || c.external_name || `Client ${c.id}`;
                    return (
                      <option key={c.id} value={c.id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Product <span className="text-rose-500">*</span>
                </label>
                <select
                  value={initiateData.productId}
                  onChange={(e) =>
                    setInitiateData((prev) => ({ ...prev, productId: e.target.value }))
                  }
                  disabled={!initiateData.clientId}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {initiateData.clientId ? 'Select a product...' : 'First select a client'}
                  </option>
                  {clientProducts.map((p) => (
                 
                 
                 <option key={p.id} value={p.id}>
                      {p.name} - SKU: {p.sku} ({p.available} available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={initiateData.quantity}
                  onChange={(e) =>
                    setInitiateData((prev) => ({
                      ...prev,
                      quantity: Math.max(1, parseInt(e.target.value) || 1),
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={initiateData.status || 'REQUESTED'}
                  onChange={(e) =>
                    setInitiateData((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {CREATE_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reason for Return <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={initiateData.reason}
                onChange={(e) =>
                  setInitiateData((prev) => ({ ...prev, reason: e.target.value }))
                }
                rows={14}
                placeholder="e.g. Defective product, wrong item shipped, customer changed mind, damaged in transit..."
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={processing}
            className="px-8 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={
              processing || 
              !initiateData.clientId || 
              !initiateData.productId || 
              !initiateData.reason.trim()
            }
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {processing ? (
              <>
                <LoadingSpinner size="sm" />
                Creating...
              </>
            ) : (
              'Create Return Request'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}