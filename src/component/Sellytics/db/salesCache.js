/**
 * SwiftCheckout - Offline Sales Cache
 * Extracted verbatim from useOfflineCache
 * ⚠️ DO NOT MODIFY LOGIC
 */

import db from './dexieDb';
import {
  generateOfflineId,
  generateClientRef,
  sanitizeRecord,
  timestamp,
} from '../utils';


// ==================== SALES ====================
export const createOfflineSale = async (
  saleData,
  storeId,
  saleGroupOfflineId = null,
  saleGroupClientRef = null
) => {
  const sid = Number(storeId);
  if (isNaN(sid)) throw new Error("Invalid store ID");

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
     server_id: null,
    _sync_attempts: 0,
    client_sale_group_ref: saleGroupOfflineId || null,
    sold_at: sanitizedData.sold_at || timestamp(),
    created_at: sanitizedData.created_at || timestamp(),
    updated_at: timestamp(),
  };

  // Add sale locally
  const newId = await db.dynamic_sales.add(sale);

  // Queue for syncing
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

  await db.sale_groups.add(group);

  const exists = await db.offline_queue
    .where({ entity_id: offlineId, entity_type: 'sale_groups', store_id: sid })
    .first();

  if (!exists) {
    await db.offline_queue.add({
      entity_type: 'sale_groups',
      operation: 'create',
      entity_id: offlineId,
      store_id: sid,
      data: { ...group },
      status: 'pending',
      priority: 0,
      sync_attempts: 0,
      client_ref: clientRef,
      created_at: timestamp(),
    });
  }

  return group;
};

//--`------------------------- GET ALL SALES --------------------------
export const getAllSales = async (storeId) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return [];

  const sales = await db.dynamic_sales.where('store_id').equals(sid).toArray();
  return sales.sort((a, b) => new Date(b.sold_at) - new Date(a.sold_at));
};
//--------------------------- SYNC SINGLE SALE (NOW SAFE) --------------------------

export const getPendingSales = async (storeId) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return [];

  return db.dynamic_sales
    .where('store_id')
    .equals(sid)
    .and(s => !s._synced)
    .toArray();
};




export const getPendingSalesCount = async (storeId) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return 0;

  return db.dynamic_sales
    .where('store_id')
    .equals(sid)
    .and(s => !s._synced && s.quantity > 0 && s.dynamic_product_id) // only real sales
    .count();
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
    updated_at: sale.updated_at || new Date().toISOString(),
  }));

  try {
    await db.dynamic_sales.bulkPut(records);
  } catch (err) {
    console.warn('Failed to cache some sales locally', err);
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

  // 3. Prepare updates for local DB
  const localUpdates = {
    ...updates,
    updated_at: new Date().toISOString(),
    _offline_status: isSynced ? 'pending_update' : 'pending',
    _synced: false, // reset synced flag on update
  };







  // 4. Update local record
  await db.dynamic_sales.update(saleId, localUpdates);

  // 5. Queue for syncing (always queue updates)
  const serverUpdates = { ...localUpdates };
  delete serverUpdates._offline_status;
  delete serverUpdates._synced;
  delete serverUpdates._offline_id;
  delete serverUpdates._client_ref;
  delete serverUpdates.client_sale_group_ref;

  const clientRef = sale._client_ref || generateClientRef();

  const existingQueue = await db.offline_queue
    .where({
      entity_type: 'dynamic_sales',
      entity_id: String(saleId),
      operation: 'update'
    })
    .first();

  if (existingQueue) {
    // Update existing queue item
    await db.offline_queue.update(existingQueue.queue_id, {
      data: { ...existingQueue.data, ...serverUpdates },
      status: 'pending',
      updated_at: new Date().toISOString(),
    });
  } else {
    // Create new queue item
    await db.offline_queue.add({
      entity_type: 'dynamic_sales',
      operation: 'update',
      entity_id: String(saleId),
      store_id: sale.store_id,
      data: serverUpdates,
      status: 'pending',
      priority: 2,
      sync_attempts: 0,
      client_ref: clientRef,
      created_at: new Date().toISOString(),
    });
  }

  return { ...sale, ...localUpdates };
};

export const deleteOfflineSale = async (saleId) => {
  const sale = await db.dynamic_sales.get(saleId);
  if (!sale || sale._synced) return false;

  if (sale._offline_id) {
    await db.offline_queue
      .where('entity_id')
      .equals(sale._offline_id)
      .delete();
  }

  await db.dynamic_sales.delete(saleId);
  return true;
};


export const markSaleSynced = async (offlineId, serverId) => {
  const sale = await db.dynamic_sales
    .where('_offline_id')
    .equals(offlineId)
    .first();

  if (sale) {
    // Update local sale
    await db.dynamic_sales.update(sale.id, {
      id: serverId || sale.id,
      _synced: true,
      _offline_status: 'synced',
    });

    // Find and mark the queue item as synced using client_ref
    const clientRef = sale._client_ref;
    if (clientRef) {
      await db.offline_queue
        .where('client_ref')
        .equals(clientRef)
        .modify({ 
          status: 'synced', 
          updated_at: new Date().toISOString() 
        });
    }
  }
};




// Mark queue item as synced (using client_ref for safety)
export const markQueueItemSynced = async (clientRef) => {
  if (!clientRef) return; // skip if no ref

  await db.offline_queue
    .where('client_ref')
    .equals(clientRef)
    .modify({
      status: 'synced',
      updated_at: new Date().toISOString()
    });
};

// Mark queue item as failed
export const markQueueItemFailed = async (clientRef, reason) => {
  if (!clientRef) return;

  await db.offline_queue
    .where('client_ref')
    .equals(clientRef)
    .modify({
      status: 'failed',
      error: reason,
      updated_at: new Date().toISOString()
    });
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
    const ids = s.device_id
      ?.split(',')
      .map(d => d.trim().toLowerCase()) || [];
    return ids.includes(normalized);
  });
};
