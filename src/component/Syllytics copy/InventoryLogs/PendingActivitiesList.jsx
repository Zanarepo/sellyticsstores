/**
 * SwiftInventory - Pending Activities List
 * Shows offline queued inventory changes
 */
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, Pause, Play, Trash2, 
  Package, RefreshCw, Plus, Minus
} from 'lucide-react';

export default function PendingActivitiesList({
  pendingUpdates,
  pendingImeiUpdates,
  isOnline,
  isSyncing,
  syncProgress,
  onSync,
  onPauseSync,
  onClearQueue,
  onDeleteUpdate
}) {
  const totalPending = (pendingUpdates?.length || 0) + (pendingImeiUpdates?.length || 0);

  if (totalPending === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-amber-800 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Pending Activities
              </h3>
              <p className="text-sm text-slate-500">
                {totalPending} change{totalPending > 1 ? 's' : ''} waiting to sync
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSyncing && (
              <button
                onClick={onPauseSync}
                className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
              >
                {syncProgress?.paused ? (
                  <Play className="w-4 h-4 text-amber-600" />
                ) : (
                  <Pause className="w-4 h-4 text-amber-600" />
                )}
              </button>
            )}
            
            <button
              onClick={onSync}
              disabled={!isOnline || isSyncing}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>

            <button
              onClick={onClearQueue}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress */}
        {isSyncing && syncProgress && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-amber-700 dark:text-amber-300 mb-1">
              <span>Syncing...</span>
              <span>{syncProgress.current} / {syncProgress.total}</span>
            </div>
            <div className="h-2 bg-amber-200 dark:bg-amber-900/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-amber-600"
                initial={{ width: 0 }}
                animate={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Activity List */}
      <div className="max-h-64 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-700">
        {/* Inventory Updates */}
        {pendingUpdates?.map((update) => (
          <div
            key={update.id}
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Package className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">
                  Quantity Update
                </p>
                <p className="text-xs text-slate-500">
                  {update.type === 'inventory_update' ? 'Stock adjustment' : update.reason}
                </p>
              </div>
            </div>
            <button
              onClick={() => onDeleteUpdate(update.id)}
              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* IMEI Updates */}
        {pendingImeiUpdates?.map((update) => (
          <div
            key={update.id}
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                update.action === 'add'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                {update.action === 'add' ? (
                  <Plus className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Minus className="w-4 h-4 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">
                  {update.action === 'add' ? 'Add' : 'Remove'} Device ID
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  {update.imei}
                </p>
              </div>
            </div>
            <button
              onClick={() => onDeleteUpdate(update.id, true)}
              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}