/**
 * Product Detail Modal
 */
import React from 'react';
import { X, Package, DollarSign, Box, User, Smartphone, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DetailModal({ product, isOpen, onClose }) {
  if (!isOpen || !product) return null;

  const imeiList = product.dynamic_product_imeis?.split(',').filter(Boolean) || [];
  const qty = product.is_unique ? imeiList.length : (product.purchase_qty || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {product.name}
              </h2>
              {product.is_unique && (
                <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                  IMEI Tracked Product
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Pricing Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-medium">Selling Price</span>
              </div>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                ₦{Number(product.selling_price || 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-medium">Purchase Price</span>
              </div>
              <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                ₦{Number(product.purchase_price || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Box className="w-5 h-5 text-slate-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500">Quantity in Stock</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                  {qty} {product.is_unique ? 'unit(s)' : 'items'}
                </p>
              </div>
            </div>

            {product.suppliers_name && (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-slate-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500">Supplier</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                    {product.suppliers_name}
                  </p>
                </div>
              </div>
            )}

            {product.device_id && (
              <div className="flex items-start gap-3">
                <Hash className="w-5 h-5 text-slate-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500">Product ID</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                    {product.device_id}
                  </p>
                </div>
              </div>
            )}

            {product.is_unique && imeiList.length > 0 && (
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-slate-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500 mb-3">
                    IMEI Numbers ({imeiList.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {imeiList.map((imei, i) => (
                      <span
                        key={i}
                        className="px-3 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm rounded-lg font-mono"
                      >
                        {imei}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profit Margin */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Profit per Unit
            </p>
            <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
              ₦{(Number(product.selling_price || 0) - Number(product.purchase_price || 0)).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}