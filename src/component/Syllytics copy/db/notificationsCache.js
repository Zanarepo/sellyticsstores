/**
 * Notification Cache
 * Handles notifications using offlineCache/Dexie
 */

import db from './dexieDb'; // low-level Dexie DB

const notificationCache = {
  // Add a notification
  async addNotification(storeId, type, message, extra = {}) {
    const sid = Number(storeId);
    if (isNaN(sid)) return;

    await db.notifications.add({
      store_id: sid,
      type,           // e.g., 'sync_success', 'sync_failed', 'offline_action'
      message,        // human-readable text
      read: false,
      dismissed: false,
      created_at: new Date().toISOString(),
      ...extra
    });
  },

  // Get all notifications for a store
  async getNotifications(storeId) {
    const sid = Number(storeId);
    if (isNaN(sid)) return [];
    
    return await db.notifications
      .where('store_id')
      .equals(sid)
      .sortBy('created_at'); // oldest first
  },

  // Clear all notifications for a store
  async clearNotifications(storeId) {
    const sid = Number(storeId);
    if (isNaN(sid)) return;
    
    await db.notifications
      .where('store_id')
      .equals(sid)
      .delete();
  },

  // Mark a notification as read
  async markNotificationRead(notificationId) {
    const id = Number(notificationId);
    if (isNaN(id)) return;

    await db.notifications.update(id, { read: true });
  },

  // Count unread notifications for a store
  async getUnreadCount(storeId) {
    const sid = Number(storeId);
    if (isNaN(sid)) return 0;

    return await db.notifications
      .where({ store_id: sid, read: false })
      .count();
  }
};

export default notificationCache;
