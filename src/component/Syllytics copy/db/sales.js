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
    client_sale_group_ref: saleGroupOfflineId || null,
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

  return db.dynamic_sales
    .where('store_id')
    .equals(sid)
    .and(s => !s._synced)
    .toArray();
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
    _offline_status: isSynced 
      ? 'pending_update' 
      : (sale._offline_status || 'pending'),
  };

  // 4. Update local record first
  await db.dynamic_sales.update(saleId, localUpdates);

  // 5. If already synced → queue update
  if (isSynced) {
    const serverUpdates = { ...localUpdates };
    delete serverUpdates._offline_status;
    delete serverUpdates._synced;
    delete serverUpdates._offline_id;
    delete serverUpdates._client_ref;
    delete serverUpdates.client_sale_group_ref;

    const existingQueue = await db.offline_queue
      .where({
        entity_type: 'dynamic_sales',
        entity_id: String(sale.id),
        operation: 'update'
      })
      .first();

    if (existingQueue) {
      await db.offline_queue.update(existingQueue.queue_id, {
        data: { ...existingQueue.data, ...serverUpdates },
        status: 'pending',
        updated_at: new Date().toISOString(),
      });
    } else {
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
    const ids = s.device_id
      ?.split(',')
      .map(d => d.trim().toLowerCase()) || [];
    return ids.includes(normalized);
  });
};
