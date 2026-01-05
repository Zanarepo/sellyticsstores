/**
 * NotificationBadge Component
 * Shows sync notifications with badge count
 */
import React, { useState } from 'react';
import { 
  Bell, X, Check, AlertCircle, Clock, 
  RefreshCw, Package, Trash2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBadge({
  notifications = [],
  pendingCount = 0,
  onClear,
  onClearAll
}) {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length + (pendingCount > 0 ? 1 : 0);

  const getIcon = (type) => {
    switch (type) {
      case 'sync_complete':
        return <Check className="w-4 h-4 text-emerald-500" />;
      case 'sync_failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'product_created':
        return <Package className="w-4 h-4 text-indigo-500" />;
      case 'product_updated':
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case 'product_deleted':
        return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'cleanup':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        <Bell className="w-5 h-5" />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Notifications
                </h3>
                {notifications.length > 0 && (
                  <button
                    onClick={() => {
                      onClearAll();
                      setIsOpen(false);
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {pendingCount > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        {pendingCount} pending sync
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Will sync when online
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 && pendingCount === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No notifications</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`
                        flex items-start gap-3 p-3 border-b border-slate-100 dark:border-slate-700 last:border-0
                        ${!notif.read ? 'bg-slate-50 dark:bg-slate-700/50' : ''}
                      `}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {notif.message}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {formatDistanceToNow(new Date(notif.timestamp))} ago
                        </p>
                      </div>
                      <button
                        onClick={() => onClear(notif.id)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                      >
                        <X className="w-3 h-3 text-slate-400" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}