// components/Expense/ExpDetailedModal.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Tag, FileText, Receipt } from 'lucide-react';
import { useCurrency } from '../../context/currencyContext';

export default function ExpDetailedModal({ expense, onClose }) {
  const { preferredCurrency = { code: 'USD', symbol: '$' } } = useCurrency() || {};

  // If no expense (safety check), don't render anything
  if (!expense) return null;

  const formattedDate = expense.expense_date
    ? new Date(expense.expense_date).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'No date recorded';

  const formattedAmount = Number(expense.amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

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
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Receipt className="w-7 h-7 text-red-600 dark:text-red-400" />
              Expense Details
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {expense.description || 'No description provided'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Date & Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div className="p-6 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                Date
              </p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {formattedDate}
              </p>
            </div>

            {/* Amount */}
            <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/20 rounded-2xl border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2 mb-2">
                <Receipt className="w-4 h-4" />
                Amount Spent
              </p>
              <p className="text-3xl font-extrabold text-red-600 dark:text-red-400">
                {preferredCurrency.symbol}{formattedAmount}
              </p>
            </div>
          </div>

          {/* Category */}
          <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl border border-indigo-200 dark:border-indigo-800">
            <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4" />
              Category
            </p>
            <p className="text-2xl font-bold capitalize text-indigo-700 dark:text-indigo-300">
              {expense.category || 'Uncategorized'}
            </p>
          </div>

          {/* Note - Optional */}
          {expense.note && (
            <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4" />
                Note
              </p>
              <p className="text-lg italic leading-relaxed text-slate-800 dark:text-slate-200">
                "{expense.note}"
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900">
          <button
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}