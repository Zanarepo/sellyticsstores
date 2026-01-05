
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

export default function BulkDeleteConfirm({ isOpen, onClose, onConfirm, count }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-red-50 to-orange-50 dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Confirm Deletion
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-4 mb-6">
              <p className="text-slate-900 dark:text-white font-semibold mb-2">
                You are about to delete:
              </p>
              <div className="flex items-center gap-2 text-3xl font-bold text-red-600 dark:text-red-400">
                <Trash2 className="w-8 h-8" />
                {count} sale{count !== 1 ? 's' : ''}
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400 mb-4">
              All receipts and related data for these sales will be permanently deleted. 
              This action cannot be reversed.
            </p>

            <p className="text-sm text-slate-500 dark:text-slate-500 font-medium">
              Are you absolutely sure you want to proceed?
            </p>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold transition shadow-lg shadow-red-500/30"
            >
              <Trash2 className="w-5 h-5" />
              Delete {count}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}