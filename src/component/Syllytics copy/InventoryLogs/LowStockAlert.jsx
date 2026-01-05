/**
 * SwiftInventory - Low Stock Alert Component
 * Displays low stock warning banner
 */
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ChevronRight, X } from 'lucide-react';

export default function LowStockAlert({
  count,
  onViewAll,
  onDismiss
}) {
  if (count === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <p className="font-medium text-amber-800 dark:text-amber-200">
            {count} product{count !== 1 ? 's' : ''} running low
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Restock soon to avoid stockouts
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </button>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1.5 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}