import db from '../Sellytics/db/dexieDb';

export const generateOfflineId = () =>
  `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const generateClientRef = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;

export const timestamp = () => new Date().toISOString();

export const sanitizeRecord = (record) =>
  Object.fromEntries(
    Object.entries(record).filter(([_, v]) => v !== null && v !== undefined)
  );

export const withMetadata = (record, storeId, synced = true) => ({
  ...sanitizeRecord(record),
  store_id: Number(storeId),
  _synced: synced,
  _sync_attempts: 0,
  _offline_status: synced ? 'synced' : 'pending',
  updated_at: timestamp(),
});

export const clearAllCache = async (storeId) => db.clearStoreData(storeId);
export const getStats = (storeId) => db.getStats(storeId);
