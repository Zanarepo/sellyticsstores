import db from './dexieDb';
import { withMetadata, timestamp } from '../utils';

// ==================== INVENTORY CACHE ====================

// Cache inventories locally
export const cacheInventories = async (inventories, storeId) => {
  if (!inventories?.length) return;
  const sid = Number(storeId);
  if (isNaN(sid)) return;

  const records = inventories.map(i => withMetadata(i, sid));
  await db.dynamic_inventory.bulkPut(records);
};

// Get a single inventory by product
export const getInventoryByProductId = async (productId, storeId) => {
  const sid = Number(storeId);
  const pid = Number(productId);
  if (isNaN(sid) || isNaN(pid)) return null;

  return db.dynamic_inventory
    .where({ dynamic_product_id: pid, store_id: sid })
    .first();
};


export async function queueOfflineAction({
  entity_type,
  operation,
  entity_id,
  store_id,
  data
}) {
  if (!entity_id || !store_id) return;

  await db.offline_queue.add({
    entity_type,
    operation,
    entity_id: Number(entity_id),
    store_id: Number(store_id),
    data,
    status: 'pending',
    created_at: new Date().toISOString()
  });
}






export const queueInventoryUpdate = async (storeId, productId, operation, data) => {
  const sid = Number(storeId);
  if (isNaN(sid)) throw new Error('Invalid storeId');

  await db.offline_queue.add({
    entity_type: 'dynamic_inventory',
    operation,
    entity_id: String(productId),
    store_id: sid,
    data,
    status: 'pending',
    priority: 1,
    sync_attempts: 0,
    client_ref: `inv_${productId}_${Date.now()}`,
    created_at: timestamp(),
  });
};





// Get all inventory for a store
export const getAllInventory = async (storeId) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return [];
  return db.dynamic_inventory.where('store_id').equals(sid).toArray();
};

// Update inventory quantity and queue adjustment
export const updateCachedInventory = async (
  productId,
  storeId,
  newAvailableQty,
  reason = 'Offline update'
) => {
  const inventory = await getInventoryByProductId(productId, storeId);
  if (!inventory) return null;

  const difference = newAvailableQty - inventory.available_qty;

  await db.dynamic_inventory.update(inventory.id, {
    available_qty: newAvailableQty,
    _offline_status: inventory._synced ? 'pending_update' : 'pending',
    _synced: false,
    updated_at: timestamp(),
  });

  await queueInventoryAdjustment(inventory.id, inventory.store_id, difference, reason);

  return { ...inventory, available_qty: newAvailableQty };
};

// ==================== QUEUE HELPERS ====================

// Queue inventory adjustment for syncing
export const queueInventoryAdjustment = async (
  inventoryId,
  storeId,
  difference,
  reason = 'Offline adjustment'
) => {
  const sid = Number(storeId);
  if (isNaN(sid)) throw new Error('Invalid storeId');

  await db.offline_queue.add({
    entity_type: 'dynamic_inventory',
    operation: 'adjust',
    entity_id: String(inventoryId),
    store_id: sid,
    data: { difference, reason },
    status: 'pending',
    priority: 1,
    sync_attempts: 0,
    client_ref: `inv_adj_${inventoryId}_${Date.now()}`,
    created_at: timestamp(),
  });
};





export const getQueueCount = async (storeId) => {
  const sid = Number(storeId);
  if (isNaN(sid)) {
    return { inventoryUpdates: [], imeiUpdates: [], adjustments: [] };
  }

  const inventoryUpdates = await db.offline_queue
    .where({ store_id: sid, entity_type: 'dynamic_inventory', status: 'pending' })
    .toArray();

  const imeiUpdates = await db.offline_queue
    .where({ store_id: sid, entity_type: 'imei', status: 'pending' })
    .toArray();

  const adjustments = await db.offline_queue
    .where({ store_id: sid, entity_type: 'inventory_adjustment', status: 'pending' })
    .toArray();

  return { inventoryUpdates, imeiUpdates, adjustments };
};

// src/component/Syllytics/db/inventoryCache.js

export const queueAdjustment = async (
  storeId,
  inventoryId,
  difference,
  reason = 'Offline adjustment'
) => {
  const sid = Number(storeId);
  const iid = Number(inventoryId);

  if (isNaN(sid) || isNaN(iid)) {
    throw new Error('Invalid adjustment data');
  }

  await db.offline_queue.add({
    entity_type: 'inventory_adjustment',
    operation: 'adjust',
    entity_id: String(iid),
    store_id: sid,
    data: { difference, reason },
    status: 'pending',
    priority: 1,
    sync_attempts: 0,
    client_ref: `adj_${iid}_${Date.now()}`,
    created_at: new Date().toISOString()
  });
};






// Mark a queue item as synced
export const markQueueItemSynced = async (queue_id) => {
  await db.offline_queue
    .where('queue_id')
    .equals(queue_id)
    .modify({ status: 'synced', updated_at: new Date().toISOString() });
};

// Mark a queue item as failed
export const markQueueItemFailed = async (queue_id, reason) => {
  await db.offline_queue
    .where('queue_id')
    .equals(queue_id)
    .modify({ status: 'failed', error: reason, updated_at: new Date().toISOString() });
};

// Get all pending queue items for a store
export const getPendingQueueItems = async (storeId) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return [];
  return db.offline_queue
    .where({ store_id: sid, status: 'pending' })
    .toArray();
};

// Clear all queue items for a store
export const clearSyncQueue = async (storeId) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return;
  await db.offline_queue.where('store_id').equals(sid).delete();
};

// Mark a queue item as synced (generic)
export const markAsSynced = async (entity_type, id) => {
  await db.offline_queue
    .where({ entity_type, id })
    .modify({ status: 'synced', updated_at: new Date().toISOString() });
};
export const queueImeiUpdate = async (
  storeId,
  productId,
  operation,
  imei
) => {
  const sid = Number(storeId);
  const pid = Number(productId);

  if (isNaN(sid) || isNaN(pid) || !imei) {
    throw new Error('Invalid IMEI queue data');
  }

  await db.offline_queue.add({
    entity_type: 'imei',
    operation,
    entity_id: String(pid),
    store_id: sid,
    data: { imei },
    status: 'pending',
    priority: 2,
    sync_attempts: 0,
    client_ref: `imei_${pid}_${Date.now()}`,
    created_at: new Date().toISOString()
  });
};



// Clear synced items
export const clearSyncedItems = async (storeId) => {
  await db.offline_queue
    .where({ store_id: storeId, status: 'synced' })
    .delete();
};

// Set last sync timestamp
export const setLastSync = async (storeId) => {
  return db.setLastSyncTime(storeId); // uses metadata table
};

export const getLastSync = async (storeId) => {
  return db.getLastSyncTime(storeId);
};




// ==================== DEFAULT EXPORT ====================
const inventoryCache = {
  cacheInventories,
  getAllInventory,
  getInventoryByProductId,
  updateCachedInventory,
  queueInventoryAdjustment,
  getQueueCount,
  markQueueItemSynced,
  markQueueItemFailed,
  getPendingQueueItems,
  clearSyncQueue,
  markAsSynced,
  clearSyncedItems,
  setLastSync,
  queueInventoryUpdate,
  queueImeiUpdate,
  getLastSync,
  queueAdjustment,
};

export default inventoryCache;