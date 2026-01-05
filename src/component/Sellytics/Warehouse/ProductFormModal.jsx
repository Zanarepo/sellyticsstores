import React, { useState, useEffect } from 'react';
import { Loader2, Package, Barcode } from "lucide-react";

export default function ProductFormModal({
  open,
  onClose,
  onSubmit,
  product = null,
  warehouse,
  clients = [],
  isLoading = false
}) {
  const [formData, setFormData] = useState({
    product_name: '',
    sku: '',
    is_serialized: false,
    purchase_price: '',
    selling_price: '',
    category: '',
    client_id: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        product_name: product.product_name || '',
        sku: product.sku || '',
        is_serialized: product.is_serialized || false,
        purchase_price: product.purchase_price || '',
        selling_price: product.selling_price || '',
        category: product.category || '',
        client_id: product.client_id || ''
      });
    } else {
      setFormData({
        product_name: '',
        sku: '',
        is_serialized: false,
        purchase_price: '',
        selling_price: '',
        category: '',
        client_id: ''
      });
    }
  }, [product, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      warehouse_id: warehouse?.id,
      purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
      selling_price: formData.selling_price ? parseFloat(formData.selling_price) : null
    });
  };

  const generateSKU = () => {
    const prefix = formData.product_name
      .trim()
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word[0]?.toUpperCase())
      .join('')
      .slice(0, 4)
      .padEnd(4, 'X');

    const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData(prev => ({ ...prev, sku: `${prefix}-${suffix}` }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold">
                {product ? 'Edit Product' : 'Add Product'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-sm opacity-70 transition hover:opacity-100"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Product Name */}
          <div className="space-y-2">
            <label htmlFor="product_name" className="text-sm font-medium text-slate-700">
              Product Name *
            </label>
            <input
              id="product_name"
              type="text"
              value={formData.product_name}
              onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
              placeholder="iPhone 15 Pro Max"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* SKU / Barcode */}
          <div className="space-y-2">
            <label htmlFor="sku" className="text-sm font-medium text-slate-700">
              SKU / Barcode
            </label>
            <div className="flex gap-2">
              <input
                id="sku"
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                placeholder="SKU-001"
                className="flex-1 rounded-lg border border-slate-300 px-4 py-3 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button
                type="button"
                onClick={generateSKU}
                className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Generate
              </button>
            </div>
          </div>

          {/* Client Assignment */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Assign to Client *</label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Select client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.external_name || `Store #${client.store_id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="purchase_price" className="text-sm font-medium text-slate-700">
                Purchase Price
              </label>
              <input
                id="purchase_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.purchase_price}
                onChange={(e) => setFormData(prev => ({ ...prev, purchase_price: e.target.value }))}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="selling_price" className="text-sm font-medium text-slate-700">
                Selling Price
              </label>
              <input
                id="selling_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.selling_price}
                onChange={(e) => setFormData(prev => ({ ...prev, selling_price: e.target.value }))}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium text-slate-700">
              Category
            </label>
            <input
              id="category"
              type="text"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="Electronics, Accessories..."
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Serialized Toggle */}
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <Barcode className="h-5 w-5 text-slate-400" />
              <div>
                <p className="font-medium text-slate-700">Serialized Product</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Track by IMEI/serial numbers
                </p>
              </div>
            </div>
            {/* Custom Toggle Switch */}
    <label className="relative inline-flex h-6 w-11 items-center cursor-pointer">
  <input
    type="checkbox"
    className="sr-only" // hides the native checkbox but keeps it accessible
    checked={formData.is_serialized}
    onChange={() =>
      setFormData(prev => ({ ...prev, is_serialized: !prev.is_serialized }))
    }
  />
  <span
    className={`block h-6 w-11 rounded-full transition-colors ${
      formData.is_serialized ? 'bg-blue-600' : 'bg-slate-300'
    }`}
  />
  <span
    className={`absolute left-1 top-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
      formData.is_serialized ? 'translate-x-5' : 'translate-x-0'
    }`}
  />
</label>

          </div>
        </form>

        {/* Footer */}
        <div className="flex flex-row-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !formData.product_name || !formData.client_id}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 font-medium text-white shadow-md transition hover:from-blue-700 hover:to-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              product ? 'Update Product' : 'Add Product'
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
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