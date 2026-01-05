/**
 * SwiftCheckout - Dexie Database
 * Production-grade IndexedDB with offline-first support
 * @version 2.0.0
 */
import Dexie from 'dexie';

const db = new Dexie('SellyticsOfflineDB');

db.version(2).stores({
  // ==================== CORE ENTITIES ====================
  
  dynamic_product: 'id, store_id, name, device_id, is_unique, created_at, updated_at, [store_id+device_id], _offline_status',

  dynamic_inventory: 'id, dynamic_product_id, store_id, [dynamic_product_id+store_id], updated_at, _offline_status',

 dynamic_sales: `
  ++id,
  _offline_id,
  store_id,
  sale_group_id,
  dynamic_product_id,
  quantity,
  client_sale_group_ref,
  unit_price,
  amount,
  payment_method,
  device_id,
  device_size,
  customer_id,
  customer_name,
  _offline_status,
  _synced,
  created_at,
  [store_id+_offline_status] 
`
  ,
sale_groups: `
  ++id,
  _offline_id,
  store_id,
  total_amount,
  payment_method,
  customer_id,
  customer_name,
  email_receipt,
  client_sale_group_ref,
  _offline_status,
  _synced,
  created_at,
  [store_id+_offline_status]
`
  ,


  // ==================== REFERENCE DATA ====================
  
  customer: 'id, store_id, fullname, email, [store_id+fullname]',

  stores: 'id, email_address, shop_name',

  store_users: 'id, store_id, email_address, role, [store_id+email_address]',

  // ==================== OFFLINE SUPPORT ====================
  
  offline_queue: '++queue_id, entity_type, operation, entity_id, store_id, status, priority, created_at, client_ref, [store_id+status], [entity_type+status]',

  notifications: '++id, store_id, type, read, dismissed, created_at, [store_id+read]',

  sync_log: '++id, store_id, entity_type, operation, status, timestamp',

  metadata: 'key'
});
// ==================== HELPER METHODS ====================

db.getLastSyncTime = async (storeId) => {
  const record = await db.metadata.get(`last_sync_${storeId}`);
  return record?.value || null;
};

db.setLastSyncTime = async (storeId) => {
  await db.metadata.put({
    key: `last_sync_${storeId}`,
    value: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
};

db.clearStoreData = async (storeId) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return;
  
  await Promise.all([
    db.dynamic_product.where('store_id').equals(sid).delete(),
    db.dynamic_inventory.where('store_id').equals(sid).delete(),
    db.dynamic_sales.where('store_id').equals(sid).delete(),
    db.sale_groups.where('store_id').equals(sid).delete(),
    db.customer.where('store_id').equals(sid).delete(),
    db.offline_queue.where('store_id').equals(sid).delete(),
    db.notifications.where('store_id').equals(sid).delete()
  ]);
};

db.getStats = async (storeId) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return { products: 0, inventory: 0, sales: 0, pendingQueue: 0, unread: 0 };
  
  const [products, inventory, sales, pendingQueue, unread] = await Promise.all([
    db.dynamic_product.where('store_id').equals(sid).count(),
    db.dynamic_inventory.where('store_id').equals(sid).count(),
    db.dynamic_sales.where('store_id').equals(sid).count(),
    db.offline_queue.where({ store_id: sid, status: 'pending' }).count(),
    db.notifications.where({ store_id: sid, read: false }).count()
  ]);

  return { products, inventory, sales, pendingQueue, unread };
};

export default db;