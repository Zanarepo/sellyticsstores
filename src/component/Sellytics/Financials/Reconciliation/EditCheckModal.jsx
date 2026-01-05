/**
 * EditCheckModal - Redesigned to match EditReturnModal style
 * Footer always visible, scrollable content, professional layout
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';

export default function EditCheckModal({
  isOpen,
  onClose,
  selectedCheck,
  setSelectedCheck,
  onSave,
  isLoading,
}) {
  const { formatPrice } = useCurrency();

  if (!isOpen || !selectedCheck) return null;

  const discrepancy = (selectedCheck.actual_amount || 0) - (selectedCheck.expected_amount || 0);

  const handleSave = () => {
    onSave();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] max-h-[90vh] flex flex-col overflow-hidden"
        >
          <div className="h-full flex flex-col">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Edit Reconciliation Check
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Update actual amount, status, and notes
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
                    <DollarSign className="w-5 h-5" />
                    <span className="text-sm font-medium">Expected</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                    {formatPrice(selectedCheck.expected_amount || 0)}
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                    <DollarSign className="w-5 h-5" />
                    <span className="text-sm font-medium">Actual</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {formatPrice(selectedCheck.actual_amount || 0)}
                  </p>
                </div>

                <div className={`rounded-xl p-4 border ${
                  discrepancy > 0 
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                    : discrepancy < 0
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                    : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                }`}>
                  <div className={`flex items-center gap-2 mb-2 ${
                    discrepancy > 0 ? 'text-red-600 dark:text-red-400' :
                    discrepancy < 0 ? 'text-amber-600 dark:text-amber-400' :
                    'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Discrepancy</span>
                  </div>
                  <p className={`text-2xl font-bold ${
                    discrepancy > 0 ? 'text-red-700 dark:text-red-300' :
                    discrepancy < 0 ? 'text-amber-700 dark:text-amber-300' :
                    'text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {formatPrice(Math.abs(discrepancy))}
                    {discrepancy !== 0 && (
                      <span className="text-sm font-normal ml-2">
                        ({discrepancy > 0 ? 'Short' : 'Over'})
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm font-medium">Check Date</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                    {selectedCheck.check_date || 'N/A'}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-2">
                    <span className="text-sm font-medium">Payment Method</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 capitalize">
                    {selectedCheck.payment_method || 'All Methods'}
                  </p>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Actual Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedCheck.actual_amount || ''}
                    onChange={(e) =>
                      setSelectedCheck({
                        ...selectedCheck,
                        actual_amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Enter actual amount received"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Status *
                  </label>
                  <select
                    value={selectedCheck.status || 'pending'}
                    onChange={(e) =>
                      setSelectedCheck({ ...selectedCheck, status: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  >
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    rows={4}
                    value={selectedCheck.notes || ''}
                    onChange={(e) =>
                      setSelectedCheck({ ...selectedCheck, notes: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all"
                    placeholder="Explain any discrepancy or resolution steps..."
                  />
                </div>
              </div>
            </div>

            {/* Footer - Always Visible */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex gap-3 justify-end flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}