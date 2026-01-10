/**
 * SwiftCheckout - Pending Sales List
 * Shows offline sales waiting to sync
 * @version 1.0.0
 */
import React from 'react';
import {
  Cloud, CloudOff, RefreshCw, Pause, Play, Trash2,
  Package, Clock, Edit2, AlertCircle, CheckCircle,

} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import CustomDropdown, { DropdownItem, DropdownSeparator } from './CustomDropdown';

export default function PendingSalesList({
  pendingSales,
  isOnline,
  isSyncing,
  syncPaused,
  syncProgress,
  onSync,
  onPauseSync,
  onClearQueue,
  onEditSale,
  onDeleteSale,
  formatPrice
}) {
  if (pendingSales.length === 0) {
    return null;
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return format(new Date(dateStr), 'MMM d, h:mm a');
    } catch {
      return dateStr;
    }
  };

  const totalPending = pendingSales.reduce((sum, sale) => {
    if (sale.lines) {
      return sum + sale.lines.reduce((lineSum, l) => lineSum + (l.quantity * l.unit_price), 0);
    }
    return sum + (sale.amount || sale.quantity * sale.unit_price || 0);
  }, 0);

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-amber-200 dark:border-amber-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              {isOnline ? (
                <Cloud className="w-5 h-5 text-amber-600" />
              ) : (
                <CloudOff className="w-5 h-5 text-amber-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Pending Sales
              </h3>
              <p className="text-xs text-slate-500">
                {pendingSales.length} sale{pendingSales.length > 1 ? 's' : ''} • {formatPrice(totalPending)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sync Progress */}
            {isSyncing && syncProgress.total > 0 && (
              <div className="text-xs text-amber-700 dark:text-amber-300">
                {syncProgress.current}/{syncProgress.total}
              </div>
            )}

            {/* Pause/Resume */}
            {isSyncing && (
              <button
                onClick={onPauseSync}
                className="p-2 rounded-lg hover:bg-amber-200/50 transition-colors"
                title={syncPaused ? 'Resume sync' : 'Pause sync'}
              >
                {syncPaused ? (
                  <Play className="w-4 h-4 text-amber-600" />
                ) : (
                  <Pause className="w-4 h-4 text-amber-600" />
                )}
              </button>
            )}

            {/* Sync Button */}
            <button
              onClick={onSync}
              disabled={!isOnline || isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>

            {/* Clear Queue */}
            <button
              onClick={() => {
                if (window.confirm('Clear all pending sales? This cannot be undone.')) {
                  onClearQueue();
                }
              }}
              className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
              title="Clear queue"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sync Progress Bar */}
        {isSyncing && syncProgress.total > 0 && (
          <div className="mt-3 h-1.5 bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </div>

      {/* Sales List */}
      <div className="divide-y divide-amber-100 dark:divide-amber-800/50">
        <AnimatePresence>
          {pendingSales.map((sale) => (
            <motion.div
              key={sale.id || sale._offline_id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4"
            >
              {/* Mobile Card Layout */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Product Info */}
                  {sale.lines ? (
                    // Multiple lines
                    <div className="space-y-1">
                      {sale.lines.slice(0, 2).map((line, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          <span className="font-medium text-slate-900 dark:text-white truncate">
                            {line.productName || 'Product'}
                          </span>
                          <span className="text-xs text-slate-500">
                            ×{line.quantity}
                          </span>
                        </div>
                      ))}
                      {sale.lines.length > 2 && (
                        <p className="text-xs text-slate-500 pl-6">
                          +{sale.lines.length - 2} more items
                        </p>
                      )}
                    </div>
                  ) : (
                    // Single line (legacy format)
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-500" />
                      <span className="font-medium text-slate-900 dark:text-white truncate">
                        {sale.product_name || 'Product'}
                      </span>
                      <span className="text-xs text-slate-500">
                        ×{sale.quantity}
                      </span>
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(sale.sold_at || sale.created_at)}
                    </div>

                    {/* Sync Status */}
                    <div className="flex items-center gap-1">
                      {sale._offline_status === 'failed' ? (
                        <>
                          <AlertCircle className="w-3 h-3 text-red-500" />
                          <span className="text-red-600">Failed</span>
                        </>
                      ) : sale._synced ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-600">Synced</span>
                        </>
                      ) : (
                        <>
                          <CloudOff className="w-3 h-3 text-amber-500" />
                          <span className="text-amber-600">Pending</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Device IDs */}
                  {(sale.device_id || sale.lines?.some(l => l.deviceIds)) && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(sale.device_id?.split(',') || []).slice(0, 3).map((id, i) => (
                        <span key={i} className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded text-xs font-mono">
                          {id.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Amount & Actions */}
                <div className="flex items-start gap-2 ml-4">
                  <div className="text-right">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatPrice(
                        sale.lines
                          ? sale.lines.reduce((sum, l) => sum + (l.quantity * l.unit_price), 0)
                          : (sale.amount || sale.quantity * sale.unit_price || 0)
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      {sale.payment_method || 'Cash'}
                    </div>
                  </div>

                  {/* Actions Dropdown */}
                  {!sale._synced && (
                    <CustomDropdown>
                      {({ close }) => (
                        <>
                          <DropdownItem
                            icon={Edit2}
                            onClick={() => {
                              onEditSale(sale);
                              close();
                            }}
                          >
                            Edit Sale
                          </DropdownItem>

                          <DropdownSeparator />

                          {/* Delete option — disabled when offline */}
                          <DropdownItem
                            icon={Trash2}
                            variant="danger"
                            onClick={() => {
                              if (window.confirm('Delete this pending sale?')) {
                                onDeleteSale(sale.id);
                              }
                              close();
                            }}
                            disabled={!isOnline}  // ← THIS LINE DISABLES DELETE WHEN OFFLINE
                            className={!isOnline ? 'opacity-50 cursor-not-allowed' : ''} // Optional: visual feedback
                          >
                            {isOnline ? 'Delete Sale' : 'Delete Sale (offline - disabled)'}
                          </DropdownItem>
                        </>
                      )}
                    </CustomDropdown>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}