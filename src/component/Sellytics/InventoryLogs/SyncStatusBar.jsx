/**
 * SwiftInventory - Sync Status Bar Component
 * Now with toast notifications for every action!
 */
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Wifi, WifiOff, RefreshCw, Pause, Play, 
  Loader2, Check, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';  // ← ADD THIS IMPORT

export default function SyncStatusBar({
  isOnline,
  pendingCount,
  isSyncing,
  syncPaused,
  syncProgress,
  onSync,
  onPause,
  onResume,
  onClear
}) {
  const handleSync = () => {
    onSync?.();
    toast.loading('Syncing your data...', { id: 'sync' }); // replaces old one
  };

  const handlePauseResume = () => {
    if (syncPaused) {
      onResume?.();
      toast.success('Sync resumed', { id: 'sync' });
    } else {
      onPause?.();
      toast('Sync paused', { 
        icon: 'Pause',
        style: { background: '#f59e0b' },
        id: 'sync'
      });
    }
  };

  // Optional: Show success when everything is synced
  React.useEffect(() => {
    if (pendingCount === 0 && isOnline && !isSyncing) {
      toast.dismiss('sync'); // clear loading
      toast.success('All data synced!', { duration: 3000 });
    }
  }, [pendingCount, isOnline, isSyncing]);

  // Show when going offline/online
  React.useEffect(() => {
    if (isOnline) {
      toast.success('Back online!', { icon: 'Wifi', duration: 2000 });
    } else {
      toast('Offline mode', { 
        icon: 'WifiOff',
        style: { background: '#dc2626' },
        duration: 5000
      });
    }
  }, [isOnline]);

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      {/* Connection Status */}
      <div className="flex items-center gap-3">
        <div className={`
          flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
          ${isOnline 
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' 
            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
          }
        `}>
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline</span>
            </>
          )}
        </div>

        {/* Sync Progress */}
        {isSyncing && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>
              Syncing {syncProgress.current}/{syncProgress.total}...
            </span>
          </div>
        )}
      </div>

      {/* Pending Actions */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            {pendingCount} pending
          </span>
          
          {isOnline && !isSyncing && (
            <button
              onClick={handleSync}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-medium hover:bg-indigo-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Now
            </button>
          )}
          
          {isSyncing && (
            <button
              onClick={handlePauseResume}
              className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition"
            >
              {syncPaused ? (
                <Play className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Pause className="w-3.5 h-3.5 text-amber-600" />
              )}
            </button>
          )}
        </div>
      )}

      {/* All Synced */}
      {pendingCount === 0 && isOnline && !isSyncing && (
        <div className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
          <Check className="w-4 h-4" />
          <span>All synced</span>
        </div>
      )}
    </div>
  );
}