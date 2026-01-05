/**
 * Reasons Analysis Modal
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp } from 'lucide-react';

export default function ReasonsAnalysisModal({ isOpen, onClose, reasons }) {
  if (!isOpen) return null;

  const maxCount = reasons[0]?.count || 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-indigo-600" />
              Top Return Reasons
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(80vh-80px)]">
            {reasons.length > 0 ? (
              reasons.map((item, idx) => {
                const percentage = (item.count / maxCount) * 100;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                        {item.reason}
                      </span>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                        {item.count} returns
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      />
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">No reasons recorded yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}