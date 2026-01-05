
/**
 * Production Dexie.js Database
 * Mirrors Supabase schema with offline-first support
 * @version 2.0.0
 */
import Dexie from 'dexie';

const db = new Dexie('SellyticsOfflineDB');

db.version(1).stores({
  // ==================== CORE ENTITIES ====================
  
  dynamic_product: `
    id,
    store_id,
    name,
    device_id,
    is_unique,
    created_at,
    updated_at,
    [store_id+device_id],
    _offline_status
  `,

  dynamic_inventory: `
    id,
    dynamic_product_id,
    store_id,
    [dynamic_product_id+store_id],
    updated_at,
    _offline_status
  `,

  dynamic_sales: `
    id,
    dynamic_product_id,
    store_id,
    sale_group_id,
    device_id,
    sold_at,
    status,
    [store_id+sold_at],
    [store_id+status],
    _offline_id,
    _offline_status,
    _synced
  `,

  sale_groups: `
    id,
    store_id,
    created_at,
    [store_id+created_at],
    _offline_id,
    _offline_status,
    _synced
  `,

  // ==================== REFERENCE DATA ====================
  
  customers: `
    id,
    store_id,
    fullname,
    email,
    [store_id+fullname]
  `,

  stores: `
    id,
    email_address,
    shop_name
  `,

  store_users: `
    id,
    store_id,
    email_address,
    [store_id+email_address]
  `,

  // ==================== OFFLINE SUPPORT ====================
  
  offline_queue: `
    ++queue_id,
    entity_type,
    operation,
    entity_id,
    store_id,
    status,
    priority,
    created_at,
    [store_id+status],
    [entity_type+status]
  `,

  notifications: `
    ++id,
    store_id,
    type,
    read,
    dismissed,
    created_at,
    [store_id+read]
  `,

  sync_log: `
    ++id,
    store_id,
    entity_type,
    status,
    timestamp
  `,

  metadata: `
    key
  `
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
  await Promise.all([
    db.dynamic_product.where('store_id').equals(sid).delete(),
    db.dynamic_inventory.where('store_id').equals(sid).delete(),
    db.dynamic_sales.where('store_id').equals(sid).delete(),
    db.sale_groups.where('store_id').equals(sid).delete(),
    db.customers.where('store_id').equals(sid).delete(),
    db.offline_queue.where('store_id').equals(sid).delete(),
    db.notifications.where('store_id').equals(sid).delete()
  ]);
};

db.getStats = async (storeId) => {
  const sid = Number(storeId);
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