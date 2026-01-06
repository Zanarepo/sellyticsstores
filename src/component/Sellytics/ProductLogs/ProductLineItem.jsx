/**
 * Product Line Item Component
 */
import React from 'react';
import { Trash2, Scan, Package } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductLineItem({
  product,
  index,
  onChange,
  onRemove,
  onScan,
  canRemove
}) {
  const imeiList = product.dynamic_product_imeis?.split(',').filter(Boolean) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">
            Product #{index + 1}
          </span>
        </div>
        
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Product Names *
          </label>
          <input
            type="text"
            value={product.name}
            onChange={(e) => onChange(index, 'name', e.target.value)}
            placeholder="e.g., iPhone 13 Pro Max"
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Purchase Price */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Purchase Price *
          </label>
          <input
            type="number"
            value={product.purchase_price}
            onChange={(e) => onChange(index, 'purchase_price', e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Selling Price */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Selling Price *
          </label>
          <input
            type="number"
            value={product.selling_price}
            onChange={(e) => onChange(index, 'selling_price', e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Supplier */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Supplier
          </label>
          <input
            type="text"
            value={product.suppliers_name}
            onChange={(e) => onChange(index, 'suppliers_name', e.target.value)}
            placeholder="Supplier name (optional)"
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Unique Tracking Toggle */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={product.is_unique}
              onChange={(e) => onChange(index, 'is_unique', e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
            />
            <div>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                Track individual items (IMEI/Serial)
              </span>
              <p className="text-xs text-slate-500">
                Enable for phones, laptops, or unique items
              </p>
            </div>
          </label>
        </div>

        {/* Conditional Fields */}
        {product.is_unique ? (
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Scanned IMEIs ({imeiList.length})
              </label>
              <button
                type="button"
                onClick={() => onScan(index)}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
              >
                <Scan className="w-4 h-4" />
                Scan IMEI
              </button>
            </div>

            {imeiList.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {imeiList.map((imei, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-full font-mono"
                  >
                    {imei}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              value={product.purchase_qty}
              onChange={(e) => onChange(index, 'purchase_qty', e.target.value)}
              placeholder="0"
              min="1"
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}