// components/Expense/AddExpenseModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, DollarSign, Calendar, Tag, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const categories = [
  'Rent', 'Salary', 'Utilities', 'Transport', 'Supplies',
  'Marketing', 'Repairs', 'Food', 'Internet', 'Other'
];

export default function AddExpenseModal({ expense, onClose, onSuccess }) {
  const isEdit = !!expense?.id;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    description: expense?.description || '',
    amount: expense?.amount || '',
    category: expense?.category || '',
    expense_date: expense?.expense_date || new Date().toISOString().split('T')[0],
    note: expense?.note || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.category.trim()) {
      toast.error('Category is required');
      return;
    }

    if (!form.amount || form.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);

    try {
      toast.success(isEdit ? 'Expense updated successfully!' : 'Expense added successfully!');
      onSuccess?.({
        ...form,
        amount: parseFloat(form.amount),
      });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg h-[90vh] max-h-[90vh] flex flex-col overflow-hidden"
        >
          <div className="h-full flex flex-col">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {isEdit ? 'Edit Expense' : 'Add New Expense'}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Record or update an expense entry
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Amount & Date - Prominent */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <DollarSign className="w-4 h-4" />
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    disabled={isSubmitting}
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Calendar className="w-4 h-4" />
                    Expense Date *
                  </label>
                  <input
                    type="date"
                    value={form.expense_date}
                    onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Tag className="w-4 h-4" />
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <FileText className="w-4 h-4" />
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  disabled={isSubmitting}
                  placeholder="e.g., Office electricity bill, Staff lunch"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <FileText className="w-4 h-4" />
                  Notes (optional)
                </label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  rows={4}
                  disabled={isSubmitting}
                  placeholder="Any additional details..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all"
                />
              </div>
            </div>

            {/* Footer - Always Visible */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex gap-3 justify-end flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold transition"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {isEdit ? 'Update Expense' : 'Add Expense'}
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}