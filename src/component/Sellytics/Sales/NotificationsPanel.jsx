/**
 * SwiftCheckout - Notifications Panel
 * Shows sync notifications and activity
 * @version 1.0.0
 */
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, X, Check, Cloud, CloudOff, Package, 
  AlertCircle, CheckCircle, Clock, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import offlineCache from '../db/offlineCache';
import { getIdentity } from '../services/identityService';

export default function NotificationsPanel({ isOpen, onClose }) {
  const { currentStoreId } = getIdentity();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!currentStoreId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const notifs = await offlineCache.getNotifications(currentStoreId);
      setNotifications(notifs || []);

      const count = await offlineCache.getUnreadCount(currentStoreId);
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      // Optionally show a toast/error state here
    }
  }, [currentStoreId]);

  // Effect: initial load + polling
  useEffect(() => {
    loadNotifications(); // Initial load (safe due to guard inside)

    const interval = setInterval(() => {
      loadNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, [loadNotifications]); // loadNotifications already depends on currentStoreId

  // Mark as read
  const handleMarkRead = async (id) => {
    if (!id) return;
    await offlineCache.markNotificationRead(id);
    loadNotifications();
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    if (!currentStoreId) return;
    await offlineCache.markAllNotificationsRead(currentStoreId);
    loadNotifications();
  };

  // Dismiss
  const handleDismiss = async (id) => {
    if (!id) return;
    await offlineCache.dismissNotification(id);
    loadNotifications();
  };

  // Get icon for notification type
  const getIcon = (type) => {
    switch (type) {
      case 'sale_created_offline':
        return <Package className="w-4 h-4 text-amber-500" />;
      case 'sync_complete':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'sync_error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'network_online':
        return <Cloud className="w-4 h-4 text-emerald-500" />;
      case 'network_offline':
        return <CloudOff className="w-4 h-4 text-amber-500" />;
      case 'queue_cleared':
        return <Trash2 className="w-4 h-4 text-slate-500" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-500" />;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      
      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      return format(date, 'MMM d, h:mm a');
    } catch {
      return '';
    }
  };

  if (!isOpen) return null;

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
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Notifications
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Bell className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500">No notifications</p>
                <p className="text-sm text-slate-400 mt-1">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      !notif.read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notif.read ? 'font-medium' : ''} text-slate-900 dark:text-white`}>
                          {notif.title}
                        </p>
                        {notif.message && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {notif.message}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(notif.created_at)}
                          </span>
                          
                          {!notif.read && (
                            <button
                              onClick={() => handleMarkRead(notif.id)}
                              className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Mark read
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDismiss(notif.id)}
                            className="text-xs text-slate-400 hover:text-red-500"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Notification Badge for header
export function NotificationBadge({ onClick }) {
  const { currentStoreId } = getIdentity();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadCount = async () => {
      if (!currentStoreId) {
        setUnreadCount(0);
        return;
      }

      try {
        const count = await offlineCache.getUnreadCount(currentStoreId);
        setUnreadCount(count || 0);
      } catch (error) {
        console.error('Failed to load unread count:', error);
        setUnreadCount(0);
      }
    };

    loadCount();
    const interval = setInterval(loadCount, 10000);
    return () => clearInterval(interval);
  }, [currentStoreId]);

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}