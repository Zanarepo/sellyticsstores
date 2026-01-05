/**
 * SwiftCheckout - View Sale Modal
 * Shows detailed sale information
 * @version 1.0.0
 */
import React from 'react';
import { 
  X, Package, Calendar, CreditCard, User, Hash,
  Receipt, Clock, Store
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function ViewSaleModal({ sale, onClose, formatPrice }) {
  if (!sale) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return format(new Date(dateStr), 'MMMM d, yyyy h:mm a');
    } catch {
      return dateStr;
    }
  };

  const deviceIds = sale.device_id?.split(',').filter(Boolean) || sale.deviceIds || [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                <Receipt className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Sale Details
                </h2>
                <p className="text-sm text-slate-500">
                  #{sale.id || 'Pending'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Product Info */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                  <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {sale.product_name || 'Product'}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span>Qty: {sale.quantity}</span>
                    <span>@ {formatPrice(sale.unit_price)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatPrice(sale.amount || (sale.quantity * sale.unit_price))}
                  </p>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Date</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {formatDate(sale.sold_at)}
                  </p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Payment</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {sale.payment_method || 'Cash'}
                  </p>
                </div>
              </div>

              {/* Customer */}
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Customer</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {sale.customer_name || 'Walk-in'}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Status</p>
                  <p className={`font-medium ${
                    sale.status === 'sold' 
                      ? 'text-emerald-600' 
                      : 'text-amber-600'
                  }`}>
                    {sale.status || 'Sold'}
                  </p>
                </div>
              </div>
            </div>

            {/* Device IDs */}
            {deviceIds.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Hash className="w-4 h-4 text-slate-500" />
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    Device IDs / IMEIs
                  </h4>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-2">
                  {deviceIds.map((id, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <span className="font-mono text-sm text-slate-700 dark:text-slate-300">
                        {id.trim()}
                      </span>
                      <span className="text-xs text-slate-400">
                        #{index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seller Info */}
            {sale.created_by_email && (
              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <Store className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Sold By</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {sale.created_by_email}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t dark:border-slate-800">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}