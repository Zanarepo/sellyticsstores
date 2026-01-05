import React from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Plus } from 'lucide-react';

export default function AddCheckModal({
  isOpen,
  onClose,
  newCheck,
  setNewCheck,
  paymentMethods,
  onSave,
  isLoading,
}) {
  if (!isOpen) return null;



  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 flex flex-col"
      >
        {/* Header - Sticky */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <Plus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Check</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Record a reconciliation check</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-6 space-y-6">
          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Payment Method
            </label>
            <select
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              value={newCheck.payment_method}
              onChange={(e) => setNewCheck({ ...newCheck, payment_method: e.target.value })}
              disabled={isLoading}
            >
              <option value="">Select method</option>
              <option value="All Payment Methods">All Payment Methods</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          {/* Expected Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Expected Amount
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={newCheck.expected_amount}
              disabled
            />
          </div>

          {/* Actual Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Actual Amount
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              value={newCheck.actual_amount || ''}
              onChange={(e) =>
                setNewCheck({
                  ...newCheck,
                  actual_amount: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="Enter actual amount"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Status
            </label>
            <select
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              value={newCheck.status}
              onChange={(e) => setNewCheck({ ...newCheck, status: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Notes
            </label>
            <textarea
              rows={4}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white resize-none"
              value={newCheck.notes || ''}
              onChange={(e) => setNewCheck({ ...newCheck, notes: e.target.value })}
              placeholder="Add any notes or observations..."
            />
          </div>
        </div>

        {/* Footer - Horizontal Buttons */}
        <div className="flex flex-row gap-3 px-6 py-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Check'
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}