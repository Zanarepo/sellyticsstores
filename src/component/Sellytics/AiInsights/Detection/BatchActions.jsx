/**
 * Batch Actions Component
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, CheckSquare, Square } from 'lucide-react';

export default function BatchActions({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onBatchDelete
}) {
  if (totalCount === 0) return null;

  const allSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="font-semibold text-indigo-900 dark:text-indigo-200">
                  {selectedCount} incident{selectedCount > 1 ? 's' : ''} selected
                </p>
                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                  Batch actions available
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={allSelected ? onClearSelection : onSelectAll}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                {allSelected ? (
                  <>
                    <Square className="w-4 h-4" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-4 h-4" />
                    Select All
                  </>
                )}
              </button>

              <button
                onClick={onBatchDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}