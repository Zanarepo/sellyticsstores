/**
 * SyncStatusBanner Component
 * Shows sync status with progress bar
 */
import React from 'react';
import { Wifi, WifiOff, RefreshCw, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export default function SyncStatusBanner({
  isOnline,
  isSyncing,
  pendingCount,
  syncProgress,
  lastSyncTime,
  onSync
}) {
  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`
          ${isOnline 
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600' 
            : 'bg-gradient-to-r from-amber-500 to-orange-500'
          }
          text-white shadow-lg
        `}
      >
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <div>
                    <div className="text-sm font-medium">
                      Syncing... {syncProgress.current}/{syncProgress.total}
                    </div>
                    <div className="text-xs opacity-80">
                      Please wait...
                    </div>
                  </div>
                </>
              ) : !isOnline ? (
                <>
                  <WifiOff className="w-4 h-4" />
                  <div>
                    <div className="text-sm font-medium">
                      Working Offline
                    </div>
                    <div className="text-xs opacity-80">
                      {pendingCount > 0 
                        ? `${pendingCount} change${pendingCount > 1 ? 's' : ''} pending`
                        : 'All changes saved locally'
                      }
                    </div>
                  </div>
                </>
              ) : pendingCount > 0 ? (
                <>
                  <Clock className="w-4 h-4" />
                  <div>
                    <div className="text-sm font-medium">
                      {pendingCount} Pending Sync
                    </div>
                    <div className="text-xs opacity-80">
                      {lastSyncTime 
                        ? `Last synced ${formatDistanceToNow(new Date(lastSyncTime))} ago`
                        : 'Ready to sync'
                      }
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {isSyncing && (
              <div className="flex-1 max-w-xs hidden sm:block">
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(syncProgress.current / Math.max(syncProgress.total, 1)) * 100}%` 
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {isOnline && pendingCount > 0 && !isSyncing && (
              <button
                onClick={onSync}
                className="flex items-center gap-2 px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Sync Now
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}