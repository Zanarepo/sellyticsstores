import db from './dexieDb';
import {
  generateClientRef,
  sanitizeRecord,
  timestamp,
} from '../utils';
import { getPendingSales } from './salesCache';

// ==================== QUEUE ====================

export const queueOperation = async (
  entityType,
  operation,
  entityId,
  storeId,
  data,
  priority = 2,
  clientRef = null
) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return;

  const exists = await db.offline_queue
    .where({ entity_id: entityId, entity_type: entityType, store_id: sid })
    .first();
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

  return items.sort(
    (a, b) => (a.priority || 2) - (b.priority || 2)
  );
};

export const markQueueItemSynced = (queueId) =>
  db.offline_queue.update(queueId, {
    status: 'synced',
    last_sync_attempt: timestamp(),
  });

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

  return db.offline_queue
    .where({ store_id: sid, status: 'pending' })
    .count();
};

export const clearSyncQueue = async (storeId) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return;

  await db.offline_queue
    .where('store_id')
    .equals(sid)
    .delete();

  const pendingSales = await getPendingSales(sid);
  for (const sale of pendingSales) {
    await db.dynamic_sales.update(sale.id, {
      _offline_status: 'cleared',
      _synced: false,
    });
  }
};

export async function markClientRefSynced(client_ref) {
  return db.offline_queue
    .where('client_ref')
    .equals(client_ref)
    .modify({
      status: 'synced',
      _synced: true,
      synced_at: new Date().toISOString(),
    });
}

export async function getPendingSalesGrouped(storeId) {
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
        store_id: row.store_id,
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
