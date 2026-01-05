/**
 * SwiftInventory - Notification Panel
 * Shows activity notifications and sync status
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Bell, Check, Trash2, RefreshCw, Package, 
  Plus, Minus, AlertTriangle, CheckCircle2
} from 'lucide-react';

export default function NotificationPanel({
  show,
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onClear
}) {
  if (!show) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'restock': return <Plus className="w-4 h-4 text-emerald-600" />;
      case 'adjust': return <Minus className="w-4 h-4 text-amber-600" />;
      case 'sync': return <RefreshCw className="w-4 h-4 text-indigo-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default: return <Package className="w-4 h-4 text-slate-600" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'restock': return 'bg-emerald-100 dark:bg-emerald-900/30';
      case 'adjust': return 'bg-amber-100 dark:bg-amber-900/30';
      case 'sync': return 'bg-indigo-100 dark:bg-indigo-900/30';
      case 'error': return 'bg-red-100 dark:bg-red-900/30';
      case 'success': return 'bg-emerald-100 dark:bg-emerald-900/30';
      default: return 'bg-slate-100 dark:bg-slate-800';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25 }}
          className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Bell className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">Notifications</h2>
                <p className="text-sm text-slate-500">{unreadCount} unread</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="flex items-center gap-2 p-3 border-b dark:border-slate-800">
              <button
                onClick={onMarkAllAsRead}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
              >
                <Check className="w-4 h-4" />
                Mark all read
              </button>
              <button
                onClick={onClear}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear all
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <Bell className="w-12 h-12 mb-3 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {notifications.map((notif, index) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onMarkAsRead(notif.id)}
                    className={`
                      flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors
                      ${notif.read 
                        ? 'bg-slate-50 dark:bg-slate-800/50' 
                        : 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800'
                      }
                    `}
                  >
                    <div className={`w-8 h-8 rounded-lg ${getBgColor(notif.type)} flex items-center justify-center flex-shrink-0`}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notif.read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white font-medium'}`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(notif.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 mt-2" />
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}