import db from './dexieDb';
import { timestamp } from './utils';

// ==================== SYNC LOG ====================

export const logSync = async (
  storeId,
  entityType,
  operation,
  status,
  details = {}
) => {
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

  const logs = await db.sync_log
    .where('store_id')
    .equals(sid)
    .toArray();

  return logs
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
};
