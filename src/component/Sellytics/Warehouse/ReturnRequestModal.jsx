import React, { useState } from 'react';
import { Loader2, RotateCcw, AlertCircle } from "lucide-react";

export default function ReturnRequestModal({
  open,
  onClose,
  onSubmit,
  warehouse,
  clients = [],
  products = [],
  isLoading = false
}) {
  const [formData, setFormData] = useState({
    client_id: '',
    warehouse_product_id: '',
    quantity: 1,
    serial_numbers: '',
    reason: ''
  });

  const selectedProduct = products.find(p => p.id === formData.warehouse_product_id);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const serials = formData.serial_numbers
      .split(',')
      .map(s => s.trim())
      .filter(s => s);

    onSubmit({
      warehouse_id: warehouse?.id,
      client_id: formData.client_id,
      warehouse_product_id: formData.warehouse_product_id,
      quantity: selectedProduct?.is_serialized ? serials.length : parseInt(formData.quantity || 1),
      serial_numbers: serials,
      reason: formData.reason,
      status: 'REQUESTED'
    });
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      warehouse_product_id: '',
      quantity: 1,
      serial_numbers: '',
      reason: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                <RotateCcw className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Return Request</h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Request stock return to warehouse
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="rounded-sm opacity-70 transition hover:opacity-100"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Warning Alert */}
          <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              Returns require warehouse approval before processing
            </p>
          </div>

          {/* Client Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Returning Client *</label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              <option value="">Select client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  [{client.client_type.replace('_', ' ')}] {client.external_name || `Store #${client.store_id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Product Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Product to Return *</label>
            <select
              value={formData.warehouse_product_id}
              onChange={(e) => setFormData(prev => ({ ...prev, warehouse_product_id: e.target.value }))}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              <option value="">Select product...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.product_name} {product.is_serialized && '(Serialized)'}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity or Serial Numbers */}
          {selectedProduct?.is_serialized ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Serial Numbers *</label>
              <textarea
                value={formData.serial_numbers}
                onChange={(e) => setFormData(prev => ({ ...prev, serial_numbers: e.target.value }))}
                placeholder="Enter serial numbers, comma-separated..."
                rows={4}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
              <p className="text-xs text-slate-500">
                {formData.serial_numbers.split(',').filter(s => s.trim()).length} serial(s) entered
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Quantity *</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Return Reason *</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Explain why this stock is being returned..."
              rows={4}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex flex-row-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={
              isLoading ||
              !formData.client_id ||
              !formData.warehouse_product_id ||
              !formData.reason ||
              (selectedProduct?.is_serialized
                ? formData.serial_numbers.trim() === ''
                : !formData.quantity || formData.quantity < 1)
            }
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 font-medium text-white shadow-md transition hover:from-amber-700 hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4" />
                Submit Request
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}