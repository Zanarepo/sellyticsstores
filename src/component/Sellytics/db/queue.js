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


