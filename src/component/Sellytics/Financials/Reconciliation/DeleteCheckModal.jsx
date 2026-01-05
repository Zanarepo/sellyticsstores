import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

export default function DeleteCheckModal({
  isOpen,
  onClose,
  selectedCheck,
  onConfirm,
  isLoading,
}) {
  if (!isOpen || !selectedCheck) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Delete Check?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Are you sure you want to delete the reconciliation check for{' '}
            <span className="font-semibold capitalize">{selectedCheck.payment_method}</span> on{' '}
            <span className="font-semibold">{selectedCheck.check_date}</span>?
          </p>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-sm text-red-800 dark:text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              This will permanently remove this check from your records.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {isLoading ? 'Deleting...' : 'Delete Check'}
          </button>
        </div>
      </div>
    </div>
  );
}