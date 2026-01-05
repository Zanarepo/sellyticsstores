import db from './dexieDb';
import { sanitizeRecord } from './utils';

// ==================== STORES & USERS ====================

export const cacheStore = (store) =>
  db.stores.put(sanitizeRecord(store));

export const getStore = (storeId) =>
  db.stores.get(Number(storeId));

export const cacheStoreUsers = async (users, storeId) => {
  if (!users?.length) return;
  const sid = Number(storeId);
  if (isNaN(sid)) return;

  const records = users.map(u => ({
    ...sanitizeRecord(u),
    store_id: sid,
  }));
  await db.store_users.bulkPut(records);
};

export const getStoreUser = async (storeId, email) => {
  const sid = Number(storeId);
  if (isNaN(sid) || !email) return null;

  return db.store_users
    .where({
      store_id: sid,
      email_address: email.toLowerCase().trim(),
    })
    .first();
};

export const isStoreOwner = async (storeId, email) => {
  const store = await getStore(storeId);
  return (
    store?.email_address?.toLowerCase().trim() ===
    email?.toLowerCase().trim()
  );
};
