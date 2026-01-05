// components/activity/ClearAllLogsModal.jsx
import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ClearAllLogsModal({ isOpen, onClose, onConfirm, isLoading }) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Clear All Activity Logs?
          </h2>

          <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            This will <strong>permanently delete every single log</strong> from both Sales and Product activities.
            <br /><br />
            <strong className="text-red-600">There is no undo.</strong>
          </p>

          <div className="flex gap-4 w-full">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 border border-slate-300 dark:border-slate-600 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium shadow-lg hover:from-red-700 hover:to-red-800 transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <>Clearing...</>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Yes, Delete All
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}