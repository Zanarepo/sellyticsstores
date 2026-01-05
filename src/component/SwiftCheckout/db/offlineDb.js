/**
 * SwiftCheckout - Offline Database Layer
 * Uses Dexie.js for IndexedDB operations
 */
import Dexie from 'dexie';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Initialize Dexie database
class SwiftCheckoutDB extends Dexie {
  constructor() {
    super('SwiftCheckoutDB');

    this.version(1).stores({
      products: 'id, name, store_id, dynamic_product_imeis',
      inventories: 'id, dynamic_product_id, store_id, available_qty',
      offlineSalesQueue: 'client_ref, store_id, synced, created_at',
      syncStatus: 'id, lastSyncAt, pendingCount'
    });

    this.products = this.table('products');
    this.inventories = this.table('inventories');
    this.offlineSalesQueue = this.table('offlineSalesQueue');
    this.syncStatus = this.table('syncStatus');
  }
}

const db = new SwiftCheckoutDB();

/**
 * Product cache operations
 */
export const productCache = {
  async getByBarcode(barcode, storeId) {
    if (!barcode || storeId == null) return null;
    const normalizedBarcode = String(barcode).trim().toUpperCase();
    const numericStoreId = Number(storeId);
    if (isNaN(numericStoreId)) return null;

    const products = await db.products
      .where('store_id')
      .equals(numericStoreId)
      .toArray();

    return products.find(p => {
      const imeis = p.dynamic_product_imeis?.split(',').map(i => i.trim().toUpperCase()) || [];
      return imeis.includes(normalizedBarcode) || String(p.id) === normalizedBarcode;
    }) || null;
  },

  async getById(productId) {
    if (productId == null) return null;
    return db.products.get(Number(productId));
  },

  async getByName(name, storeId) {
    if (!name || storeId == null) return [];
    const numericStoreId = Number(storeId);
    if (isNaN(numericStoreId)) return [];

    const products = await db.products
      .where('store_id')
      .equals(numericStoreId)
      .toArray();
    return products.filter(p => p.name?.toLowerCase() === name.toLowerCase());
  },

  async cacheProduct(product) {
    if (!product?.id || product.store_id == null) return;
    await db.products.put({
      ...product,
      id: Number(product.id),
      store_id: Number(product.store_id),
      cachedAt: new Date().toISOString()
    });
  },

  async cacheProducts(products) {
    if (!Array.isArray(products)) return;
    const prepared = products.map(p => ({
      ...p,
      id: Number(p.id),
      store_id: Number(p.store_id),
      cachedAt: new Date().toISOString()
    }));
    await db.products.bulkPut(prepared);
  },

  async getAllForStore(storeId) {
    if (storeId == null) return [];
    return db.products.where('store_id').equals(Number(storeId)).toArray();
  },

  async clearStoreProducts(storeId) {
    if (storeId == null) return;
    await db.products.where('store_id').equals(Number(storeId)).delete();
  }
};

/**
 * Inventory cache operations
 */
export const inventoryCache = {
  async getByProductId(productId, storeId) {
    if (productId == null || storeId == null) return null;
    const numericProductId = Number(productId);
    const numericStoreId = Number(storeId);
    if (isNaN(numericProductId) || isNaN(numericStoreId)) return null;

    return db.inventories
      .where('[dynamic_product_id+store_id]')
      .equals([numericProductId, numericStoreId])
      .first();
  },

  async getAvailableQty(productId, storeId) {
    const inv = await this.getByProductId(productId, storeId);
    return inv?.available_qty ?? 0;
  },

  async cacheInventory(inventory) {
    if (!inventory?.id || inventory.store_id == null) return;
    await db.inventories.put({
      ...inventory,
      id: Number(inventory.id),
      dynamic_product_id: Number(inventory.dynamic_product_id),
      store_id: Number(inventory.store_id),
      cachedAt: new Date().toISOString()
    });
  },

  async cacheInventories(inventories) {
    if (!Array.isArray(inventories)) return;
    const prepared = inventories.map(inv => ({
      ...inv,
      id: Number(inv.id),
      dynamic_product_id: Number(inv.dynamic_product_id),
      store_id: Number(inv.store_id),
      cachedAt: new Date().toISOString()
    }));
    await db.inventories.bulkPut(prepared);
  },

  async updateLocalQty(productId, storeId, qtyChange) {
    const inv = await this.getByProductId(productId, storeId);
    if (inv) {
      await db.inventories.update(inv.id, {
        available_qty: Math.max(0, (inv.available_qty || 0) - qtyChange)
      });
    }
  },

  async getAllForStore(storeId) {
    if (storeId == null) return [];
    return db.inventories.where('store_id').equals(Number(storeId)).toArray();
  }
};

/**
 * Offline sales queue operations
 */



export const offlineSalesQueue = {


  async queueSale(salePayload) {
    if (!salePayload || salePayload.store_id == null) {
      toast.error('Cannot save offline sale: invalid store configuration');
      return null;
    }

    const storeId = Number(salePayload.store_id);
    if (isNaN(storeId)) return null;

    const clientRef = crypto.randomUUID(); // keep using UUID
    const entry = {
      ...salePayload,
      client_ref: clientRef,
      synced: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      store_id: storeId
    };

    await db.offlineSalesQueue.put(entry); // use put, client_ref is PK
    toast.info('Sale saved offline');
    return { client_ref: clientRef };
  },



  

async getPendingSales(storeId) {
  if (storeId == null) return [];
  storeId = Number(storeId);
  if (isNaN(storeId)) return [];

  // SAFE: Filter in JavaScript instead of relying on broken boolean index
  const allPending = await db.offlineSalesQueue
    .where('store_id')
    .equals(storeId)
    .and(item => item.synced === false)
    .toArray();

  return allPending;
},

  async getPendingCount(storeId) {
    const pending = await this.getPendingSales(storeId);
    return pending.length;
  },

  async getSaleByClientRef(clientRef) {
    if (!clientRef) return null;
    return db.offlineSalesQueue.get(clientRef);
  },

  async updateSale(clientRef, updates) {
    if (!clientRef) return;
    await db.offlineSalesQueue.update(clientRef, {
      ...updates,
      updated_at: new Date().toISOString()
    });
  },

  async deleteSale(clientRef) {
    if (!clientRef) return;
    await db.offlineSalesQueue.delete(clientRef);
  },

// ADD THIS FUNCTION — fixes "markSynced is not a function"
async markSynced(clientRef, serverSaleGroupId) {
  if (!clientRef) return;
  await db.offlineSalesQueue.update(clientRef, {
    synced: true,
    server_sale_group_id: serverSaleGroupId,
    updated_at: new Date().toISOString(),
    syncError: null,
    lastSyncAttempt: null
  });
},


  async clearQueue(storeId) {
    if (storeId == null) {
      await db.offlineSalesQueue.clear();
      return;
    }

    storeId = Number(storeId);
    if (isNaN(storeId)) return;

    const sales = await this.getPendingSales(storeId);
    const refs = sales.map(s => s.client_ref);
    if (refs.length > 0) {
      await db.offlineSalesQueue.bulkDelete(refs);
    }
}

, // <-- Add this comma to separate methods

async getPendingSalesWithDetails(storeId) {
  const rawSales = await this.getPendingSales(storeId);
  
  return rawSales.map(sale => {
    // Normalize old/corrupted format → new format UI expects
    const normalizedLines = [];

    // If lines already exist and are good → use them
    if (Array.isArray(sale.lines) && sale.lines.length > 0) {
      normalizedLines.push(...sale.lines);
    } 
    // Otherwise, convert old flat format to lines array
    else if (sale.dynamic_product_id || sale.amount) {
      normalizedLines.push({
        productId: sale.dynamic_product_id,
        productName: sale.product_name || 'Cement',
        quantity: Number(sale.quantity) || 1,
        unitPrice: Number(sale.unit_price || sale.unit_price || sale.amount),
        totalPrice: Number(sale.amount || 0),
      });
    }

    const total = normalizedLines.reduce((sum, line) => sum + (line.totalPrice || line.unitPrice * line.quantity), 0);

    return {
      ...sale,
      client_ref: sale.client_ref,
      lines: normalizedLines,
      totalAmount: total || Number(sale.amount) || 0,
      paymentMethod: sale.paymentMethod || sale.payment_method || 'Cash',
    };
  });
}

};





export const syncStatusManager = {
  async getStatus() {
    const record = await db.syncStatus.get('main');
    if (!record) {
      const defaultStatus = {
        id: 'main',
        lastSyncAt: null,
        pendingCount: 0,
        isPaused: false
      };
      await db.syncStatus.put(defaultStatus);
      return defaultStatus;
    }
    return record;
  },
  async updateStatus(updates) {
    const current = await this.getStatus();
    await db.syncStatus.put({ ...current, ...updates, id: 'main' });
  },
  async setPaused(isPaused) {
    await this.updateStatus({ isPaused });
  },
  async setLastSync() {
    await this.updateStatus({ lastSyncAt: new Date().toISOString() });
  }
};


export default db;
