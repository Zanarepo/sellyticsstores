/**
 * SwiftCheckout - Sync Controls Component
 * Controls for sync status, pause/resume, clear queue
 */
import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Pause, 
  Play, 
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { formatRelativeTime } from '../SwiftCheckout/utils/formatting';

export default function SyncControls({
  isOnline,
  pendingCount,
  isSyncing,
  isPaused,
  lastSyncAt,
  onSync,
  onPause,
  onResume,
  onClearQueue,
  compact = false
}) {
  const handleClearQueue = () => {
    if (pendingCount === 0) return;
    
    if (window.confirm(`Are you sure you want to clear ${pendingCount} pending sale(s)? This cannot be undone.`)) {
      onClearQueue();
    }
  };
  
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {/* Online/Offline Status */}
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
          isOnline 
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
            : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
        }`}>
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              <span>Offline</span>
            </>
          )}
        </div>
        
        {/* Pending Count & Sync Button */}
        {pendingCount > 0 && (
          <button
            onClick={onSync}
            disabled={!isOnline || isSyncing || isPaused}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
              isSyncing
                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                : 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : `Sync (${pendingCount})`}</span>
          </button>
        )}
        
        {/* Paused Indicator */}
        {isPaused && (
          <button
            onClick={onResume}
            className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Play className="w-3 h-3" />
            <span>Resume</span>
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">
          Sync Status
        </h3>
        
        {/* Online/Offline Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
          isOnline 
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
            : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
        }`}>
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span>Offline</span>
            </>
          )}
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">Pending</span>
          </div>
          <p className={`text-2xl font-bold ${
            pendingCount > 0 
              ? 'text-amber-600 dark:text-amber-400' 
              : 'text-slate-900 dark:text-white'
          }`}>
            {pendingCount}
          </p>
        </div>
        
        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Last Sync</span>
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
            {lastSyncAt ? formatRelativeTime(lastSyncAt) : 'Never'}
          </p>
        </div>
      </div>
      
      {/* Status Message */}
      {isPaused && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
          <Pause className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Sync is paused
          </span>
        </div>
      )}
      
      {isSyncing && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
          <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
          <span className="text-sm text-indigo-600 dark:text-indigo-400">
            Syncing pending sales...
          </span>
        </div>
      )}
      
      {!isOnline && pendingCount > 0 && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="text-sm text-amber-600 dark:text-amber-400">
            {pendingCount} sale(s) will sync when online
          </span>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex gap-2">
        {/* Sync Button */}
        <button
          onClick={onSync}
          disabled={!isOnline || isSyncing || isPaused || pendingCount === 0}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
        
        {/* Pause/Resume Button */}
        {pendingCount > 0 && (
          <button
            onClick={isPaused ? onResume : onPause}
            className="p-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title={isPaused ? 'Resume sync' : 'Pause sync'}
          >
            {isPaused ? (
              <Play className="w-5 h-5 text-emerald-600" />
            ) : (
              <Pause className="w-5 h-5 text-slate-500" />
            )}
          </button>
        )}
        
        {/* Clear Queue Button */}
        {pendingCount > 0 && (
          <button
            onClick={handleClearQueue}
            className="p-2.5 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Clear queue"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        )}
      </div>
    </div>
  );
}