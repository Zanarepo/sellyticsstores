/**
 * Pending Products List - Shows offline queue
 */
import React from 'react';
import { Clock, Upload, RefreshCw, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PendingProductsList({ 
  pendingCount, 
  isSyncing, 
  onSync, 
 
}) {
  if (pendingCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-200">
              {pendingCount} item{pendingCount > 1 ? 's' : ''} pending sync
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {isSyncing ? 'Syncing now...' : 'Will sync when online'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isSyncing && (
            <button
              onClick={onSync}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
            >
              <Upload className="w-4 h-4" />
              Sync Now
            </button>
          )}
          
          {isSyncing && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Syncing...
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}