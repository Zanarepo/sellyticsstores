/**
 * SwiftCheckout - Offline Cache Manager
 * Handles all offline CRUD operations with queue management
 * @version 2.1.0
 */
import db from '../db/dexieDb';


// ==================== UTILITIES ====================

const generateOfflineId = () =>
  `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const generateClientRef = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;

const timestamp = () => new Date().toISOString();

const sanitizeRecord = (record) =>
  Object.fromEntries(
    Object.entries(record).filter(([_, v]) => v !== null && v !== undefined)
  );

const withMetadata = (record, storeId, synced = true) => ({
  ...sanitizeRecord(record),
  store_id: Number(storeId),
  _synced: synced,
  _sync_attempts: 0,
  _offline_status: synced ? 'synced' : 'pending',
  updated_at: timestamp(),
});

// ==================== PRODUCTS ====================

export const cacheProducts = async (products, storeId) => {
  if (!products?.length) return;
  const sid = Number(storeId);
  if (isNaN(sid)) return;

  const records = products.map((p) => withMetadata(p, sid));
  await db.dynamic_product.bulkPut(records);
};

export const getProductById = (productId) =>
  db.dynamic_product.get(Number(productId));

export const getProductByBarcode = async (barcode, storeId) => {
  if (!barcode || !storeId) return null;
  const normalized = barcode.trim().toLowerCase();
  const sid = Number(storeId);
  if (isNaN(sid)) return null;

  const products = await db.dynamic_product.where('store_id').equals(sid).toArray();

  // Exact match by device_id
  let match = products.find(p => p.device_id?.trim().toLowerCase() === normalized);
  if (match) return match;

  // Check IMEI list
  match = products.find(p => {
    const imeis = p.dynamic_product_imeis?.split(',').map(i => i.trim().toLowerCase()) || [];
    return imeis.includes(normalized);
  });

  return match || null;
};

export const getAllProducts = (storeId) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return Promise.resolve([]);
  return db.dynamic_product.where('store_id').equals(sid).toArray();
};

// ==================== INVENTORY ====================

export const cacheInventories = async (inventories, storeId) => {
  if (!inventories?.length) return;
  const sid = Number(storeId);
  if (isNaN(sid)) return;

  const records = inventories.map((i) => withMetadata(i, sid));
  await db.dynamic_inventory.bulkPut(records);
};

export const getInventoryByProductId = async (productId, storeId) => {
  const sid = Number(storeId);
  const pid = Number(productId);
  if (isNaN(sid) || isNaN(pid)) return null;

  return db.dynamic_inventory
    .where({ dynamic_product_id: pid, store_id: sid })
    .first();
};

export const getAllInventory = (storeId) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return Promise.resolve([]);
  return db.dynamic_inventory.where('store_id').equals(sid).toArray();
};

export const updateCachedInventory = async (productId, storeId, newAvailableQty) => {
  const inventory = await getInventoryByProductId(productId, storeId);
  if (!inventory) return null;

  await db.dynamic_inventory.update(inventory.id, {
    available_qty: newAvailableQty,
    _offline_status: 'modified',
    _synced: false,
    updated_at: timestamp(),
  });

  return inventory;
};

// ==================== SALES ====================

export const createOfflineSale = async (
  saleData,
  storeId,
  saleGroupOfflineId = null,
  saleGroupClientRef = null
) => {
  const sid = Number(storeId);
  if (isNaN(sid)) throw new Error("Invalid store ID");

  // Every line gets its own offline ID
  const offlineId = generateOfflineId(); 
  const clientRef = saleGroupClientRef || generateClientRef();

  const sanitizedData = sanitizeRecord(saleData);

  const sale = {
    ...sanitizedData,
    store_id: sid,
    _offline_id: offlineId,
    _client_ref: clientRef,
    _offline_status: 'pending',
    _synced: false,
    _sync_attempts: 0,
    client_sale_group_ref: saleGroupOfflineId || null, // link to group
    sold_at: sanitizedData.sold_at || timestamp(),
    created_at: sanitizedData.created_at || timestamp(),
    updated_at: timestamp(),
  };

  // Add to sales table
  const newId = await db.dynamic_sales.add(sale);

  // Always queue each sale line separately using its unique offlineId
  await db.offline_queue.add({
    entity_type: 'dynamic_sales',
    operation: 'create',
    entity_id: offlineId,
    store_id: sid,
    data: { ...sale, id: newId },
    status: 'pending',
    priority: 1,
    sync_attempts: 0,
    client_ref: clientRef,
    created_at: timestamp(),
  });

  return { ...sale, id: newId };
};



export const createOfflineSaleGroup = async (groupData, storeId) => {
  const offlineId = generateOfflineId();
  const clientRef = generateClientRef();
  const sid = Number(storeId);
  if (isNaN(sid)) throw new Error("Invalid store ID");

  const sanitizedData = sanitizeRecord(groupData);

  const group = {
    ...sanitizedData,
    store_id: sid,
    _offline_id: offlineId,
    _client_ref: clientRef,
    _offline_status: 'pending',
    _synced: false,
    _sync_attempts: 0,
    created_at: timestamp(),
  };

  const newId = await db.sale_groups.add(group);

  const exists = await db.offline_queue
    .where({ entity_id: offlineId, entity_type: 'sale_groups', store_id: sid })
    .first();

  if (!exists) {
    await db.offline_queue.add({
      entity_type: 'sale_groups',
      operation: 'create',
      entity_id: offlineId,
      store_id: sid,
      data: { ...group, id: newId },
      status: 'pending',
      priority: 0,
      sync_attempts: 0,
      client_ref: clientRef,
      created_at: timestamp(),
    });
  }

  return { ...group, id: newId, _offline_id: offlineId };
};

export const getAllSales = async (storeId) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return [];

  const sales = await db.dynamic_sales.where('store_id').equals(sid).toArray();
  return sales.sort((a, b) => new Date(b.sold_at) - new Date(a.sold_at));
};

export const getSalesByUser = async (storeId, userId) => {
  const sid = Number(storeId);
  const uid = Number(userId);
  if (isNaN(sid)) return [];

  const sales = await db.dynamic_sales.where('store_id').equals(sid).toArray();
  return isNaN(uid)
    ? sales
    : sales.filter(s => s.created_by_user_id === uid)
        .sort((a, b) => new Date(b.sold_at) - new Date(a.sold_at));
};

export const getPendingSales = async (storeId) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return [];

  return db.dynamic_sales.where('store_id').equals(sid).and(s => !s._synced).toArray();
};


// Add to offlineCache.ts
export const cacheSales = async (sales, storeId) => {
  if (!sales?.length) return;
  const sid = Number(storeId);
  if (isNaN(sid)) return;

  const records = sales.map(sale => ({
    ...sale,
    store_id: sid,
    _synced: true,
    _offline_status: 'synced',
    updated_at: sale.updated_at || new Date().toISOString()
  }));

  try {
    await db.dynamic_sales.bulkPut(records);
  } catch (err) {
    console.warn('Failed to cache some sales locally (possible duplicates)', err);
  }
};



export const updateOfflineSale = async (saleId, updates) => {
  // 1. Validate ID
  if (typeof saleId !== 'number' || isNaN(saleId)) {
    throw new Error('Invalid sale ID: must be a number');
  }

  // 2. Fetch local sale
  const sale = await db.dynamic_sales.get(saleId);
  if (!sale) {
    throw new Error('Sale not found locally');
  }

  const isSynced = !!sale._synced;

  // 3. Prepare updates for local DB (keep local fields)
  const localUpdates = {
    ...updates,
    updated_at: new Date().toISOString(),
    // Keep pending_create status if not synced yet — changes will go with original create
    _offline_status: isSynced 
      ? 'pending_update' 
      : (sale._offline_status || 'pending'),
  };

  // 4. Update local record first (so UI refreshes instantly)
  await db.dynamic_sales.update(saleId, localUpdates);

  // 5. If already synced → queue a clean update for Supabase
  if (isSynced) {
    // Remove all local-only fields before sending to server
    const serverUpdates = { ...localUpdates };
    delete serverUpdates._offline_status;
    delete serverUpdates._synced;
    delete serverUpdates._offline_id;
    delete serverUpdates._client_ref;
    delete serverUpdates.client_sale_group_ref;
    // add any other _* fields you use

    // Find existing update queue item (avoid duplicates)
    const existingQueue = await db.offline_queue
      .where({ entity_type: 'dynamic_sales', entity_id: String(sale.id), operation: 'update' })
      .first();

    if (existingQueue) {
      // Update existing queue entry
      await db.offline_queue.update(existingQueue.queue_id, {
        data: { ...existingQueue.data, ...serverUpdates },
        status: 'pending',
        updated_at: new Date().toISOString(),
      });
    } else {
      // Create new queue entry
      await db.offline_queue.add({
        entity_type: 'dynamic_sales',
        operation: 'update',
        entity_id: String(sale.id),
        store_id: sale.store_id,
        data: serverUpdates,
        status: 'pending',
        priority: 2,
        sync_attempts: 0,
        client_ref: `update_${sale.id}_${Date.now()}`,
        created_at: new Date().toISOString(),
      });
    }
  }
  // If not synced yet → changes are in local record → will be sent when original create syncs

  return { ...sale, ...localUpdates };
};







export const deleteOfflineSale = async (saleId) => {
  const sale = await db.dynamic_sales.get(saleId);
  if (!sale || sale._synced) return false;

  if (sale._offline_id) {
    await db.offline_queue.where('entity_id').equals(sale._offline_id).delete();
  }

  await db.dynamic_sales.delete(saleId);
  return true;
};

export const markSaleSynced = async (offlineId, serverId) => {
  const sale = await db.dynamic_sales.where('_offline_id').equals(offlineId).first();
  if (sale) {
    await db.dynamic_sales.update(sale.id, {
      id: serverId || sale.id,
      _synced: true,
      _offline_status: 'synced',
    });
  }
};

export const checkDeviceSold = async (deviceId, storeId) => {
  const sid = Number(storeId);
  if (isNaN(sid) || !deviceId) return false;
  
  const normalized = deviceId.trim().toLowerCase();
  const sales = await db.dynamic_sales
    .where('store_id')
    .equals(sid)
    .toArray();
    
  return sales.some(s => {
    const ids = s.device_id?.split(',').map(d => d.trim().toLowerCase()) || [];
    return ids.includes(normalized);
  });
};

// ==================== CUSTOMERS ====================

export const cacheCustomers = async (customers, storeId) => {
  if (!customers?.length) return;
  const sid = Number(storeId);
  if (isNaN(sid)) return;

  const records = customers.map(c => ({ ...sanitizeRecord(c), store_id: sid }));
  await db.customer.bulkPut(records);
};

export const getAllCustomers = (storeId) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return Promise.resolve([]);
  return db.customer.where('store_id').equals(sid).toArray();
};

// ==================== STORES & USERS ====================

export const cacheStore = (store) => db.stores.put(sanitizeRecord(store));

export const getStore = (storeId) => db.stores.get(Number(storeId));

export const cacheStoreUsers = async (users, storeId) => {
  if (!users?.length) return;
  const sid = Number(storeId);
  if (isNaN(sid)) return;

  const records = users.map(u => ({ ...sanitizeRecord(u), store_id: sid }));
  await db.store_users.bulkPut(records);
};

export const getStoreUser = async (storeId, email) => {
  const sid = Number(storeId);
  if (isNaN(sid) || !email) return null;

  return db.store_users
    .where({ store_id: sid, email_address: email.toLowerCase().trim() })
    .first();
};

export const isStoreOwner = async (storeId, email) => {
  const store = await getStore(storeId);
  return store?.email_address?.toLowerCase().trim() === email?.toLowerCase().trim();
};

// ==================== QUEUE MANAGEMENT ====================

export const queueOperation = async (entityType, operation, entityId, storeId, data, priority = 2, clientRef = null) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return;

  // Avoid duplicates
  const exists = await db.offline_queue.where({ entity_id: entityId, entity_type: entityType, store_id: sid }).first();
  if (exists) return;

  await db.offline_queue.add({
    entity_type: entityType,
    operation,
    entity_id: String(entityId),
    store_id: sid,
    data: sanitizeRecord(data),
    status: 'pending',
    priority,
    sync_attempts: 0,
    client_ref: clientRef || generateClientRef(),
    created_at: timestamp(),
  });
};

export const getPendingQueueItems = async (storeId, maxAttempts = 5) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return [];

  const items = await db.offline_queue
    .where({ store_id: sid, status: 'pending' })
    .and(item => (item.sync_attempts || 0) < maxAttempts)
    .toArray();

  return items.sort((a, b) => (a.priority || 2) - (b.priority || 2));
};

export const markQueueItemSynced = (queueId) =>
  db.offline_queue.update(queueId, { status: 'synced', last_sync_attempt: timestamp() });

export const markQueueItemFailed = async (queueId, error) => {
  const item = await db.offline_queue.get(queueId);
  if (!item) return;

  const attempts = (item.sync_attempts || 0) + 1;
  await db.offline_queue.update(queueId, {
    status: attempts >= 5 ? 'failed' : 'pending',
    sync_attempts: attempts,
    last_sync_attempt: timestamp(),
    last_error: error,
  });
};

export const getQueueCount = async (storeId) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return 0;
  return db.offline_queue.where({ store_id: sid, status: 'pending' }).count();
};

export const clearSyncQueue = async (storeId) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return;

  await db.offline_queue.where('store_id').equals(sid).delete();

  const pendingSales = await getPendingSales(sid);
  for (const sale of pendingSales) {
    await db.dynamic_sales.update(sale.id, { _offline_status: 'cleared', _synced: false });
  }
};

async function markClientRefSynced(client_ref) {
  return db.offline_queue
    .where('client_ref')
    .equals(client_ref)
    .modify({
      status: 'synced',
      _synced: true,
      synced_at: new Date().toISOString()
    });
}

async function getPendingSalesGrouped(storeId) {
  const rows = await db.offline_queue
    .where('[store_id+status]')
    .equals([storeId, 'pending'])
    .toArray();

  const grouped = {};

  for (const row of rows) {
    const key = row.client_ref;
    if (!key) continue;

    if (!grouped[key]) {
      grouped[key] = {
        client_ref: key,
        sale_group: null,
        sale_lines: [],
        created_at: row.created_at,
        store_id: row.store_id
      };
    }

    if (row.entity_type === 'sale_groups') {
      grouped[key].sale_group = row;
    }

    if (row.entity_type === 'dynamic_sales') {
      grouped[key].sale_lines.push(row);
    }
  }

  return Object.values(grouped).filter(
    s => s.sale_group && s.sale_lines.length > 0
  );
}





// ==================== NOTIFICATIONS ====================

export const addNotification = async (storeId, type, data) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return;

  await db.notifications.add({
    store_id: sid,
    type,
    title: data.title || 'Notification',
    message: data.message || '',
    entity_type: data.entity_type || null,
    entity_id: data.entity_id || null,
    read: false,
    dismissed: false,
    created_at: timestamp(),
  });
};

export const getNotifications = async (storeId, limit = 50) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return [];

  const all = await db.notifications.where('store_id').equals(sid).and(n => !n.dismissed).toArray();
  return all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, limit);
};

export const markNotificationRead = (id) => db.notifications.update(id, { read: true });

export const markAllNotificationsRead = async (storeId) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return;

  const unread = await db.notifications.where({ store_id: sid, read: false }).toArray();
  for (const n of unread) {
    await db.notifications.update(n.id, { read: true });
  }
};

export const dismissNotification = (id) => db.notifications.update(id, { dismissed: true });

export const getUnreadCount = async (storeId) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return 0;

  return db.notifications.where({ store_id: sid, read: false }).and(n => !n.dismissed).count();
};

// ==================== SYNC LOG ====================

export const logSync = async (storeId, entityType, operation, status, details = {}) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return;

  await db.sync_log.add({
    store_id: sid,
    entity_type: entityType,
    operation,
    status,
    error: details.error || null,
    details: JSON.stringify(details),
    timestamp: timestamp(),
  });
};

export const getSyncLogs = async (storeId, limit = 100) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return [];

  const logs = await db.sync_log.where('store_id').equals(sid).toArray();
  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
};

// ==================== UTILS ====================

export const clearAllCache = async (storeId) => db.clearStoreData(storeId);
export const getStats = (storeId) => db.getStats(storeId);

// ==================== AUTO-CLEAN FAILED QUEUE ====================

export const cleanupOldFailedSyncs = async (storeId, olderThanMs = 24 * 60 * 60 * 1000) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return;

  const cutoff = Date.now() - olderThanMs;
  const oldFailedItems = await db.offline_queue.where({ store_id: sid, status: 'failed' }).toArray();

  const toDelete = oldFailedItems.filter(item => new Date(item.created_at).getTime() < cutoff);
  for (const item of toDelete) await db.offline_queue.delete(item.queue_id);

  return toDelete.length;
};

// ==================== EXPORT DEFAULT ====================

const offlineCache = {
  // Products
  cacheProducts, getProductById, getProductByBarcode, getAllProducts,
  // Inventory
  cacheInventories, getInventoryByProductId, getAllInventory, updateCachedInventory,
  // Sales
  createOfflineSale, createOfflineSaleGroup, getAllSales, getSalesByUser,
  getPendingSales, updateOfflineSale, deleteOfflineSale, markSaleSynced,
  // Customers
  cacheCustomers, getAllCustomers,
  // Stores & Users
  cacheStore, getStore, cacheStoreUsers, getStoreUser, isStoreOwner,
  // Queue
  queueOperation, getPendingQueueItems, markQueueItemSynced, markQueueItemFailed,
  getQueueCount, clearSyncQueue,
  // Notifications
  addNotification, getNotifications, markNotificationRead, markAllNotificationsRead, dismissNotification, getUnreadCount,
  // Sync Log
  logSync, getSyncLogs,
  // Utils
  clearAllCache, getStats,
  // Auto-clean
  cleanupOldFailedSyncs,
  markClientRefSynced,
  getPendingSalesGrouped,
  checkDeviceSold,
  cacheSales

};

export default offlineCache;
