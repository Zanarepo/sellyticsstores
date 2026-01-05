/**
 * Offline Cache Manager
 * Handles all offline CRUD operations with queue management
 * @version 2.0.0
 */
import db from './dexieDb';

// ==================== UTILITIES ====================

const generateOfflineId = () => 
  `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const timestamp = () => new Date().toISOString();

const withMetadata = (record, storeId, synced = true) => ({
  ...record,
  store_id: Number(storeId),
  _synced: synced,
  _sync_attempts: 0,
  _offline_status: synced ? 'synced' : 'pending',
  updated_at: timestamp()
});

// ==================== PRODUCTS ====================

export const cacheProducts = async (products, storeId) => {
  if (!products?.length) return;
  const records = products.map(p => withMetadata(p, storeId));
  await db.dynamic_product.bulkPut(records);
};

export const getProductById = (productId) => 
  db.dynamic_product.get(Number(productId));

export const getProductByBarcode = async (barcode, storeId) => {
  if (!barcode || !storeId) return null;
  
  const normalized = barcode.trim().toLowerCase();
  const sid = Number(storeId);
  
  // Try direct device_id match first (faster)
  const directMatch = await db.dynamic_product
    .where({ store_id: sid, device_id: barcode.trim() })
    .first();
  
  if (directMatch) return directMatch;
  
  // Fall back to IMEI search
  const products = await db.dynamic_product.where('store_id').equals(sid).toArray();
  
  return products.find(p => {
    if (p.device_id?.toLowerCase() === normalized) return true;
    const imeis = p.dynamic_product_imeis?.split(',').map(i => i.trim().toLowerCase()) || [];
    return imeis.includes(normalized);
  }) || null;
};

export const getAllProducts = (storeId) => 
  db.dynamic_product.where('store_id').equals(Number(storeId)).toArray();

// ==================== INVENTORY ====================

export const cacheInventories = async (inventories, storeId) => {
  if (!inventories?.length) return;
  const records = inventories.map(i => withMetadata(i, storeId));
  await db.dynamic_inventory.bulkPut(records);
};

export const getInventoryByProductId = (productId, storeId) =>
  db.dynamic_inventory
    .where({ dynamic_product_id: Number(productId), store_id: Number(storeId) })
    .first();

export const updateCachedInventory = async (productId, storeId, updates) => {
  const inventory = await getInventoryByProductId(productId, storeId);
  if (!inventory) return null;
  
  await db.dynamic_inventory.update(inventory.id, {
    ...updates,
    _offline_status: 'modified',
    _synced: false,
    updated_at: timestamp()
  });
  
  await queueOperation('dynamic_inventory', 'update', inventory.id, storeId, updates);
  return inventory;
};

// ==================== SALES ====================

export const createOfflineSale = async (saleData) => {
  const offlineId = generateOfflineId();
  
  const sale = {
    ...saleData,
    _offline_id: offlineId,
    _offline_status: 'pending',
    _synced: false,
    _sync_attempts: 0,
    sold_at: saleData.sold_at || timestamp(),
    updated_at: timestamp()
  };
  
  const id = await db.dynamic_sales.add(sale);
  await queueOperation('dynamic_sales', 'create', offlineId, saleData.store_id, sale, 1);
  
  await addNotification(saleData.store_id, 'sale_created_offline', {
    title: 'Sale Saved Offline',
    message: `Sale for ${saleData.quantity} × ${saleData.product_name || 'Product'} saved`
  });
  
  return { ...sale, id };
};

export const createOfflineSaleGroup = async (groupData) => {
  const offlineId = generateOfflineId();
  
  const group = {
    ...groupData,
    _offline_id: offlineId,
    _offline_status: 'pending',
    _synced: false,
    _sync_attempts: 0,
    created_at: timestamp()
  };
  
  const id = await db.sale_groups.add(group);
  await queueOperation('sale_groups', 'create', offlineId, groupData.store_id, group, 0);
  
  return { ...group, id };
};

export const getAllSales = async (storeId) => 
  db.dynamic_sales
    .where('store_id')
    .equals(Number(storeId))
    .reverse()
    .sortBy('sold_at');

export const getPendingSales = (storeId) =>
  db.dynamic_sales
    .where('store_id')
    .equals(Number(storeId))
    .and(s => !s._synced)
    .toArray();

export const markSaleSynced = async (offlineId, serverId) => {
  const sale = await db.dynamic_sales.where('_offline_id').equals(offlineId).first();
  if (sale) {
    await db.dynamic_sales.update(sale.id, {
      id: serverId,
      _synced: true,
      _offline_status: 'synced'
    });
  }
};

// ==================== CUSTOMERS ====================

export const cacheCustomers = async (customers, storeId) => {
  if (!customers?.length) return;
  const records = customers.map(c => ({ ...c, store_id: Number(storeId) }));
  await db.customers.bulkPut(records);
};

export const getAllCustomers = (storeId) =>
  db.customers.where('store_id').equals(Number(storeId)).toArray();

// ==================== STORES & USERS ====================

export const cacheStore = (store) => db.stores.put(store);

export const cacheStoreUsers = async (users, storeId) => {
  if (!users?.length) return;
  const records = users.map(u => ({ ...u, store_id: Number(storeId) }));
  await db.store_users.bulkPut(records);
};

export const getStoreUser = (storeId, email) =>
  db.store_users
    .where({ store_id: Number(storeId), email_address: email.toLowerCase() })
    .first();

// ==================== QUEUE MANAGEMENT ====================

export const queueOperation = async (entityType, operation, entityId, storeId, data, priority = 2) => {
  await db.offline_queue.add({
    entity_type: entityType,
    operation,
    entity_id: String(entityId),
    store_id: Number(storeId),
    data,
    status: 'pending',
    priority,
    sync_attempts: 0,
    created_at: timestamp()
  });
};

export const getPendingQueueItems = (storeId, maxAttempts = 5) =>
  db.offline_queue
    .where({ store_id: Number(storeId), status: 'pending' })
    .and(item => item.sync_attempts < maxAttempts)
    .sortBy('priority');

export const markQueueItemSynced = (queueId) =>
  db.offline_queue.update(queueId, {
    status: 'synced',
    last_sync_attempt: timestamp()
  });

export const markQueueItemFailed = async (queueId, error) => {
  const item = await db.offline_queue.get(queueId);
  await db.offline_queue.update(queueId, {
    status: item.sync_attempts >= 4 ? 'failed' : 'pending',
    sync_attempts: (item?.sync_attempts || 0) + 1,
    last_sync_attempt: timestamp(),
    last_error: error
  });
};

export const getQueueCount = (storeId) =>
  db.offline_queue.where({ store_id: Number(storeId), status: 'pending' }).count();

// ==================== NOTIFICATIONS ====================

export const addNotification = async (storeId, type, data) => {
  await db.notifications.add({
    store_id: Number(storeId),
    type,
    title: data.title || 'Notification',
    message: data.message || '',
    entity_type: data.entity_type || null,
    entity_id: data.entity_id || null,
    read: false,
    dismissed: false,
    created_at: timestamp()
  });
};

export const getNotifications = async (storeId, limit = 50) => {
  const all = await db.notifications
    .where('store_id')
    .equals(Number(storeId))
    .and(n => !n.dismissed)
    .reverse()
    .sortBy('created_at');
  return all.slice(0, limit);
};

export const markNotificationRead = (id) => 
  db.notifications.update(id, { read: true });

export const dismissNotification = (id) => 
  db.notifications.update(id, { dismissed: true });

export const getUnreadCount = (storeId) =>
  db.notifications
    .where({ store_id: Number(storeId), read: false })
    .and(n => !n.dismissed)
    .count();

// ==================== SYNC LOG ====================

export const logSync = async (storeId, entityType, operation, status, details = {}) => {
  await db.sync_log.add({
    store_id: Number(storeId),
    entity_type: entityType,
    operation,
    status,
    error: details.error || null,
    details: JSON.stringify(details),
    timestamp: timestamp()
  });
};

// ==================== UTILITIES ====================

export const clearAllCache = async (storeId) => {
  await db.clearStoreData(storeId);
  await addNotification(storeId, 'cache_cleared', {
    title: 'Cache Cleared',
    message: 'All offline data has been cleared'
  });
};

export const getStats = (storeId) => db.getStats(storeId);

export default {
  cacheProducts,
  getProductById,
  getProductByBarcode,
  getAllProducts,
  cacheInventories,
  getInventoryByProductId,
  updateCachedInventory,
  createOfflineSale,
  createOfflineSaleGroup,
  getAllSales,
  getPendingSales,
  markSaleSynced,
  cacheCustomers,
  getAllCustomers,
  cacheStore,
  cacheStoreUsers,
  getStoreUser,
  queueOperation,
  getPendingQueueItems,
  markQueueItemSynced,
  markQueueItemFailed,
  getQueueCount,
  addNotification,
  getNotifications,
  markNotificationRead,
  dismissNotification,
  getUnreadCount,
  logSync,
  clearAllCache,
  getStats
};