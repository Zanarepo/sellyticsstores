import db from './dexieDb';
import { sanitizeRecord } from './utils';

// ==================== CUSTOMERS ====================

export const cacheCustomers = async (customers, storeId) => {
  if (!customers?.length) return;
  const sid = Number(storeId);
  if (isNaN(sid)) return;

  const records = customers.map(c => ({
    ...sanitizeRecord(c),
    store_id: sid,
  }));
  await db.customer.bulkPut(records);
};

export const getAllCustomers = (storeId) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return Promise.resolve([]);
  return db.customer.where('store_id').equals(sid).toArray();
};
