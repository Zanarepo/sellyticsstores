import inventoryService from './inventoryServices';
import * as inventoryCache from '../../db/inventoryCache';
import * as productCache from '../../db/productCache';
import * as customerCache from '../../db/customerCache';

const syncService = {
  isSyncing: false,
  isPaused: false,
  progress: { current: 0, total: 0 },
  listeners: [],

  // Subscribe to sync events
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  },

  notify(event) {
    this.listeners.forEach(cb => cb(event));
  },

  async syncAll(storeId, userEmail) {
  if (this.isSyncing || this.isPaused) return { success: false, message: 'Sync in progress or paused' };
  if (!storeId || !userEmail) return { success: false, message: 'Missing storeId or userEmail' };

  this.isSyncing = true;
  this.notify({ type: 'sync_start' });

  const results = {
    inventoryUpdates: { success: 0, failed: 0 },
    imeiUpdates: { success: 0, failed: 0 },
    adjustments: { success: 0, failed: 0 }
  };

  try {
    const { inventoryUpdates = [], imeiUpdates = [], adjustments = [] } = await inventoryCache.getQueueCount(storeId) || {};

    const total = inventoryUpdates.length + imeiUpdates.length + adjustments.length;
    this.progress = { current: 0, total };
    this.notify({ type: 'progress', progress: this.progress });

    // --- IMEI ---
    for (const update of imeiUpdates) {
      if (this.isPaused) break;
      const productId = Number(update.entity_id);
      const imei = update.data?.imei;
      if (!productId || !imei) { results.imeiUpdates.failed++; this.progress.current++; continue; }

      try {
        if (update.operation === 'add') await inventoryService.addImei(productId, imei, storeId, userEmail);
        else if (update.operation === 'remove') await inventoryService.removeImei(productId, imei, storeId, userEmail);

        await inventoryCache.markQueueItemSynced(update.queue_id);
        results.imeiUpdates.success++;
      } catch (err) {
        console.error('IMEI sync failed', err, update);
        await inventoryCache.markQueueItemFailed(update.queue_id, err.message);
        results.imeiUpdates.failed++;
      }
      this.progress.current++;
      this.notify({ type: 'progress', progress: this.progress });
    }

    // --- Inventory updates / restocks ---
    for (const update of inventoryUpdates) {
      if (this.isPaused) break;
      const productId = Number(update.entity_id);
      const data = typeof update.data === 'string' ? JSON.parse(update.data) : update.data;
      if (!productId || !data) { results.inventoryUpdates.failed++; this.progress.current++; continue; }

      try {
        if (update.operation === 'update') await inventoryService.updateProduct(productId, data);
        else if (update.operation === 'restock') await inventoryService.restockProduct(productId, storeId, data.quantity, data.reason, userEmail);

        await inventoryCache.markQueueItemSynced(update.queue_id);
        results.inventoryUpdates.success++;
      } catch (err) {
        console.error('Inventory sync failed', err, update);
        await inventoryCache.markQueueItemFailed(update.queue_id, err.message);
        results.inventoryUpdates.failed++;
      }
      this.progress.current++;
      this.notify({ type: 'progress', progress: this.progress });
    }

    // --- Adjustments ---
    for (const adjustment of adjustments) {
      if (this.isPaused) break;
      const inventoryId = Number(adjustment.entity_id);
      const { difference, reason } = adjustment.data || {};
      if (!inventoryId || typeof difference !== 'number') { results.adjustments.failed++; this.progress.current++; continue; }

      try {
        await inventoryService.adjustStock(inventoryId, difference, reason, userEmail);
        await inventoryCache.markQueueItemSynced(adjustment.queue_id);
        results.adjustments.success++;
      } catch (err) {
        console.error('Adjustment sync failed', err, adjustment);
        await inventoryCache.markQueueItemFailed(adjustment.queue_id, err.message);
        results.adjustments.failed++;
      }
      this.progress.current++;
      this.notify({ type: 'progress', progress: this.progress });
    }

    await inventoryCache.clearSyncedItems(storeId);
    await inventoryCache.setLastSync(storeId);

    this.notify({ type: 'sync_complete', results });
    return { success: true, results };

  } catch (err) {
    console.error('Sync failed:', err);
    this.notify({ type: 'sync_error', error: err.message });
    return { success: false, error: err.message };
  } finally {
    this.isSyncing = false;
  }
}
,


  // ==================== CACHE REFRESH ====================
  async refreshCache(storeId) {
    try {
      const [products, inventory, customers] = await Promise.all([
        inventoryService.fetchProducts(storeId),
        inventoryService.fetchInventory(storeId),
        inventoryService.fetchCustomers(storeId)
      ]);

      // Save caches in correct files
      await Promise.all([
        productCache.cacheProducts(products, storeId),
        inventoryCache.cacheInventories(inventory, storeId),
        customerCache.cacheCustomers(customers, storeId)
      ]);

      await inventoryCache.setLastSync(storeId);
      return { products, inventory, customers };
    } catch (err) {
      console.error('Cache refresh failed:', err);
      throw err;
    }
  },

  // ==================== CONTROLS ====================
  pause() {
    this.isPaused = true;
    this.notify({ type: 'sync_paused' });
  },

  resume() {
    this.isPaused = false;
    this.notify({ type: 'sync_resumed' });
  },

  getStatus() {
    return {
      isSyncing: this.isSyncing,
      isPaused: this.isPaused,
      progress: this.progress
    };
  },

  // ==================== PENDING COUNT ====================
  async getPendingCount(storeId) {
    const { inventoryUpdates, imeiUpdates, adjustments } = await inventoryCache.getQueueCount(storeId) || { inventoryUpdates: [], imeiUpdates: [], adjustments: [] };
    return inventoryUpdates.length + imeiUpdates.length + adjustments.length;
  }
};

export default syncService;
