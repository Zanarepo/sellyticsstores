/**
 * OfflineDB - IndexedDB wrapper for offline-first product catalogue
 * Production-ready with 3-hour cleanup mechanism
 */

class OfflineDB {
  constructor() {
    this.dbName = 'ProductDB';
    this.dbVersion = 2;
    this.db = null;
    this.isInitialized = false;
    
    // Start cleanup interval (check every 30 minutes)
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanupOldFailedSyncs(), 30 * 60 * 1000);
    }
  }

  /* ================= INIT ================= */
  async init() {
 if (this.db) return this.db;


    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);

  request.onsuccess = () => {
  this.db = request.result;

  // 🔥 CRITICAL FIX
  this.db.onversionchange = () => {
    this.db.close();
    this.db = null;
    this.isInitialized = false;
  };

  this.isInitialized = true;
  resolve(this.db);
};


      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        /* PRODUCTS */
        if (!db.objectStoreNames.contains('products')) {
          const store = db.createObjectStore('products', { keyPath: 'id' });
          store.createIndex('store_id', 'store_id');
          store.createIndex('sync_status', 'sync_status');
          store.createIndex('name', 'name');
          store.createIndex('created_at', 'created_at');
        }

        /* SYNC QUEUE */
        if (!db.objectStoreNames.contains('syncQueue')) {
          const store = db.createObjectStore('syncQueue', {
            keyPath: 'id',
            autoIncrement: true
          });
          store.createIndex('entity_type', 'entity_type');
          store.createIndex('action', 'action');
          store.createIndex('status', 'status');
          store.createIndex('created_at', 'created_at');
        }

        /* SYNC LOGS */
        if (!db.objectStoreNames.contains('syncLogs')) {
          const store = db.createObjectStore('syncLogs', {
            keyPath: 'id',
            autoIncrement: true
          });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('action', 'action');
        }

        /* NOTIFICATIONS */
        if (!db.objectStoreNames.contains('notifications')) {
          const store = db.createObjectStore('notifications', {
            keyPath: 'id',
            autoIncrement: true
          });
          store.createIndex('read', 'read');
          store.createIndex('timestamp', 'timestamp');
        }

        /* SETTINGS */
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        /* ID MAP */
        if (!db.objectStoreNames.contains('idMap')) {
          const store = db.createObjectStore('idMap', { keyPath: 'temp_id' });
          store.createIndex('real_id', 'real_id', { unique: true });
        }
      };
    });
  }

  /* ================= HELPERS ================= */
  async store(name, mode = 'readonly') {
    await this.init();
    return this.db.transaction(name, mode).objectStore(name);
  }

  isTempId(id) {
    return typeof id === 'string' && id.startsWith('temp_');
  }

  /* ================= ID MAP ================= */
  async saveIdMapping(tempId, realId) {
    const store = await this.store('idMap', 'readwrite');
    return new Promise((resolve) => {
      store.put({ temp_id: tempId, real_id: realId }).onsuccess = resolve;
    });
  }

  async resolveRealId(id) {
    if (!this.isTempId(id)) return id;
    const store = await this.store('idMap');
    return new Promise((resolve) => {
      store.get(id).onsuccess = (e) =>
        resolve(e.target.result?.real_id || null);
    });
  }

  /* ================= PRODUCTS ================= */
  async cacheProducts(products, storeId) {
    const store = await this.store('products', 'readwrite');
    for (const p of products) {
      store.put({
        ...p,
        store_id: Number(storeId),
        sync_status: 'synced',
        cached_at: new Date().toISOString()
      });
    }
    return true;
  }

  async getProducts(storeId) {
    const store = await this.store('products');
    return new Promise((resolve) => {
      store.index('store_id').getAll(Number(storeId)).onsuccess = (e) =>
        resolve(e.target.result.filter(p => !p.deleted));
    });
  }

  async getProductById(id) {
    const store = await this.store('products');
    return new Promise((resolve) => {
      store.get(id).onsuccess = (e) => resolve(e.target.result || null);
    });
  }

  async saveProduct(product) {
    const store = await this.store('products', 'readwrite');
    return new Promise((resolve) => {
      store.put(product).onsuccess = () => resolve(product);
    });
  }

  async addProduct(product, storeId) {
    const id = `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const record = {
      ...product,
      id,
      store_id: Number(storeId),
      sync_status: 'pending',
      created_at: new Date().toISOString(),
      cached_at: new Date().toISOString()
    };

    await this.saveProduct(record);
    await this.addToSyncQueue('product', 'create', record);
    await this.addNotification('product_created', `Product "${product.name}" created offline`);
    return record;
  }

  async updateProduct(id, updates) {
    const existing = await this.getProductById(id);
    if (!existing) throw new Error('Product not found');

    const updated = {
      ...existing,
      ...updates,
      sync_status: 'pending',
      updated_at: new Date().toISOString()
    };

    await this.saveProduct(updated);

    if (!this.isTempId(id)) {
      await this.addToSyncQueue('product', 'update', { id, updates });
    }

    await this.addNotification('product_updated', `Product "${existing.name}" updated offline`);
    return updated;
  }

  async deleteProduct(id) {
    const existing = await this.getProductById(id);
    if (!existing) return true;

    const updated = {
      ...existing,
      deleted: true,
      sync_status: 'pending_delete',
      deleted_at: new Date().toISOString()
    };

    await this.saveProduct(updated);

    if (!this.isTempId(id)) {
      await this.addToSyncQueue('product', 'delete', { id });
    }

    await this.addNotification('product_deleted', `Product "${existing.name}" queued for deletion`);
    return true;
  }

  async permanentlyDeleteProduct(id) {
    const store = await this.store('products', 'readwrite');
    return new Promise((resolve) => {
      store.delete(id).onsuccess = () => resolve(true);
    });
  }

  async markProductSynced(tempId, realId, serverData) {
    await this.saveIdMapping(tempId, realId);
    await this.permanentlyDeleteProduct(tempId);
    return this.saveProduct({
      ...serverData,
      sync_status: 'synced',
      cached_at: new Date().toISOString()
    });
  }

  /* ================= SYNC QUEUE ================= */
  async addToSyncQueue(entityType, action, data) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('syncQueue', 'readwrite');
      const store = tx.objectStore('syncQueue');
      const request = store.add({
        entity_type: entityType,
        action,
        data,
        status: 'pending',
        attempts: 0,
        created_at: new Date().toISOString()
      });
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncQueue() {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('syncQueue', 'readonly');
      const store = tx.objectStore('syncQueue');
      const index = store.index('status');
      const request = index.getAll('pending');
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markQueueItemSynced(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('syncQueue', 'readwrite');
      const store = tx.objectStore('syncQueue');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async markQueueItemFailed(id, error) {
    await this.init();
    return new Promise(async (resolve, reject) => {
      const tx = this.db.transaction('syncQueue', 'readwrite');
      const store = tx.objectStore('syncQueue');
      
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (!item) return resolve(false);
        
        item.status = item.attempts >= 3 ? 'failed' : 'pending';
        item.attempts = (item.attempts || 0) + 1;
        item.last_error = error;
        item.last_attempt = new Date().toISOString();
        
        const putRequest = store.put(item);
        putRequest.onsuccess = () => resolve(true);
        putRequest.onerror = () => reject(putRequest.error);
      };
    });
  }

  async getPendingCount() {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('syncQueue', 'readonly');
      const store = tx.objectStore('syncQueue');
      const index = store.index('status');
      const request = index.count('pending');
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /* ================= CLEANUP MECHANISM ================= */
  /**
   * Cleanup failed syncs older than 3 hours with notifications
   */
  async cleanupOldFailedSyncs(thresholdMs = 3 * 60 * 60 * 1000) {
    await this.init();
    const now = Date.now();
    const tx = this.db.transaction(['syncQueue', 'products'], 'readwrite');
    const queueStore = tx.objectStore('syncQueue');
    const productsStore = tx.objectStore('products');
    
    let cleanedCount = 0;
    const cleanedItems = [];

    return new Promise((resolve, reject) => {
      const request = queueStore.openCursor();

      request.onsuccess = async (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const item = cursor.value;
          const createdAt = new Date(item.created_at).getTime();
          const age = now - createdAt;

          // If older than 3 hours
          if (age > thresholdMs) {
            cleanedCount++;
            cleanedItems.push({
              name: item.data?.name || 'Unknown',
              action: item.action,
              created_at: item.created_at
            });

            // Delete from sync queue
            await queueStore.delete(item.id);

            // If it's a temp product, remove from products store too
            if (item.action === 'create' && item.data?.id) {
              await productsStore.delete(item.data.id);
            }
          }
          cursor.continue();
        } else {
          // Done iterating
          if (cleanedCount > 0) {
            // Add notification for each cleaned item
            cleanedItems.forEach(async (item) => {
              await this.addNotification(
                'cleanup',
                `"${item.name}" was removed (unsynced for 3+ hours)`
              );
            });

            // Log cleanup
            await this.logSync(
              'auto_cleanup',
              'success',
              `Cleaned ${cleanedCount} stale item(s)`
            );
          }
          resolve(cleanedCount);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /* ================= NOTIFICATIONS ================= */
  async addNotification(type, message) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('notifications', 'readwrite');
      const store = tx.objectStore('notifications');
      const request = store.add({
        type,
        message,
        read: false,
        timestamp: new Date().toISOString()
      });
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getNotifications(limit = 50) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('notifications', 'readonly');
      const store = tx.objectStore('notifications');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const sorted = request.result
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, limit);
        resolve(sorted);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async markNotificationRead(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('notifications', 'readwrite');
      const store = tx.objectStore('notifications');
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const notif = getRequest.result;
        if (notif) {
          notif.read = true;
          const putRequest = store.put(notif);
          putRequest.onsuccess = () => resolve(true);
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve(false);
        }
      };
    });
  }

  async clearNotifications() {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('notifications', 'readwrite');
      const store = tx.objectStore('notifications');
      const request = store.clear();
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  /* ================= SYNC LOGS ================= */
  async logSync(action, status, details = null) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('syncLogs', 'readwrite');
      const store = tx.objectStore('syncLogs');
      const request = store.add({
        action,
        status,
        details,
        timestamp: new Date().toISOString()
      });
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncLogs(limit = 100) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('syncLogs', 'readonly');
      const store = tx.objectStore('syncLogs');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const sorted = request.result
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, limit);
        resolve(sorted);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /* ================= SETTINGS ================= */
  async getSetting(key) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result?.value ?? null);
      request.onerror = () => reject(request.error);
    });
  }

  async setSetting(key, value) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const request = store.put({ key, value });
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  /* ================= UTILITIES ================= */
  async getCacheStats() {
    await this.init();
    const storeId = localStorage.getItem('store_id');
    const products = await this.getProducts(storeId);
    const pendingCount = await this.getPendingCount();
    const notifications = await this.getNotifications();
    
    return {
      products: products.length,
      pendingSync: pendingCount,
      unreadNotifications: notifications.filter(n => !n.read).length
    };
  }

  async clearAllData() {
    await this.init();
    const stores = ['products', 'syncQueue', 'syncLogs', 'notifications'];
    
    for (const storeName of stores) {
      await new Promise((resolve, reject) => {
        const tx = this.db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = resolve;
        request.onerror = () => reject(request.error);
      });
    }
    
    return true;

    
  }

  
}

// Export singleton instance
const offlineDB = new OfflineDB();
export default offlineDB;