/**
 * SwiftInventory - useNotifications Hook
 * Manages activity notifications
 */
import { useState, useEffect, useCallback } from 'react';
import offlineCache from '../../db/offlineCache';

export default function useNotifications(storeId) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!storeId) return;
    
    const notifs = await offlineCache.getNotifications(storeId);
    setNotifications(notifs);
    setUnreadCount(notifs.filter(n => !n.read).length);
  }, [storeId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Add notification
  const addNotification = useCallback(async (type, message) => {
    await offlineCache.addNotification(storeId, type, message);
    await fetchNotifications();
  }, [storeId, fetchNotifications]);

  // Mark a single notification as read
  const markAsRead = useCallback(async (id) => {
    await offlineCache.markNotificationRead(id);
    await fetchNotifications();
  }, [fetchNotifications]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    for (const notif of notifications.filter(n => !n.read)) {
      await offlineCache.markNotificationRead(notif.id);
    }
    await fetchNotifications();
  }, [notifications, fetchNotifications]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    await offlineCache.clearNotifications(storeId);
    setNotifications([]);
    setUnreadCount(0);
  }, [storeId]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    refresh: fetchNotifications
  };
}
