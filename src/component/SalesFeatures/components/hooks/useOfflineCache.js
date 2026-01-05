/**
 * useOfflineCache - Offline caching hook using Dexie
 * 
 * Provides methods for:
 * - Caching products and inventory
 * - Managing offline sales queue
 * - Sync operations
 */

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { v4 as uuidv4 } from 'uuid';
import salesDb from '../db/salesDb';
import SalesService from '../services/SalesService';

export default function useOfflineCache(storeId) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncPaused, setSyncPaused] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online');
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warn('You are offline. Sales will be saved locally.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load pending count on mount
  useEffect(() => {
    loadPendingCount();
  }, [storeId]);

  const loadPendingCount = async () => {
    try {
      const count = await salesDb.offline_sales_queue
        .where({ store_id: Number(storeId), synced: 0 })
        .count();
      setPendingCount(count);
    } catch (error) {
      console.error('Error loading pending count:', error);
    }
  };

  /**
   * Cache a product locally
   */
  const cacheProduct = useCallback(async (product) => {
    try {
      // Check if product already exists
      const existing = await salesDb.products
        .where({ store_id: Number(storeId), id: product.id })
        .first();

      if (existing) {
        await salesDb.products.update(existing.localId, product);
      } else {
        await salesDb.products.add({
          ...product,
          store_id: Number(storeId),
          cached_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error caching product:', error);
    }
  }, [storeId]);

  /**
   * Cache multiple products
   */
  const cacheProducts = useCallback(async (products) => {
    try {
      for (const product of products) {
        await cacheProduct(product);
      }
    } catch (error) {
      console.error('Error caching products:', error);
    }
  }, [cacheProduct]);

  /**
   * Get product from cache by barcode/IMEI
   */
  const getProductByBarcode = useCallback(async (barcode) => {
    try {
      const normalizedBarcode = barcode.trim();
      const products = await salesDb.products
        .where('store_id')
        .equals(Number(storeId))
        .toArray();

      // Search in dynamic_product_imeis
      const match = products.find(p => {
        const imeis = (p.dynamic_product_imeis || '').split(',').map(i => i.trim());
        return imeis.includes(normalizedBarcode);
      });

      return match || null;
    } catch (error) {
      console.error('Error getting product by barcode:', error);
      return null;
    }
  }, [storeId]);

  /**
   * Get product from cache by ID
   */
  const getProductById = useCallback(async (productId) => {
    try {
      const product = await salesDb.products
        .where({ store_id: Number(storeId), id: productId })
        .first();
      return product || null;
    } catch (error) {
      console.error('Error getting product by ID:', error);
      return null;
    }
  }, [storeId]);

  /**
   * Cache inventory record
   */
  const cacheInventory = useCallback(async (inventory) => {
    try {
      const existing = await salesDb.inventories
        .where({ store_id: Number(storeId), dynamic_product_id: inventory.dynamic_product_id })
        .first();

      if (existing) {
        await salesDb.inventories.update(existing.localId, inventory);
      } else {
        await salesDb.inventories.add({
          ...inventory,
          store_id: Number(storeId),
          cached_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error caching inventory:', error);
    }
  }, [storeId]);

  /**
   * Cache multiple inventory records
   */
  const cacheAllInventory = useCallback(async (inventories) => {
    try {
      for (const inv of inventories) {
        await cacheInventory(inv);
      }
    } catch (error) {
      console.error('Error caching inventories:', error);
    }
  }, [cacheInventory]);

  /**
   * Get inventory from cache
   */
  const getInventory = useCallback(async (productId) => {
    try {
      const inventory = await salesDb.inventories
        .where({ store_id: Number(storeId), dynamic_product_id: productId })
        .first();
      return inventory || null;
    } catch (error) {
      console.error('Error getting inventory:', error);
      return null;
    }
  }, [storeId]);

  /**
   * Update cached inventory (for local tracking)
   */
  const updateCachedInventory = useCallback(async (productId, quantitySold) => {
    try {
      const inv = await getInventory(productId);
      if (inv) {
        await salesDb.inventories.update(inv.localId, {
          ...inv,
          available_qty: Math.max(0, (inv.available_qty || 0) - quantitySold),
          quantity_sold: (inv.quantity_sold || 0) + quantitySold,
        });
      }
    } catch (error) {
      console.error('Error updating cached inventory:', error);
    }
  }, [getInventory]);

  /**
   * Queue a sale for offline sync
   */
  const queueSale = useCallback(async (salePayload) => {
    try {
      const clientRef = uuidv4();
      const identity = SalesService.getIdentity();

      const offlineSale = {
        client_ref: clientRef,
        store_id: Number(storeId),
        payload: {
          ...salePayload,
          created_by_user_id: identity.currentUserId,
          created_by_stores: identity.currentStoreId,
          created_by_email: identity.currentUserEmail,
        },
        created_at: new Date().toISOString(),
        synced: 0, // 0 = pending, 1 = synced
        sync_attempts: 0,
        last_error: null,
      };

      await salesDb.offline_sales_queue.add(offlineSale);
      await loadPendingCount();

      toast.info('Sale saved offline. Will sync when online.');
      return { success: true, client_ref: clientRef };
    } catch (error) {
      console.error('Error queuing sale:', error);
      toast.error('Failed to save sale offline');
      return { success: false, error: error.message };
    }
  }, [storeId]);

  /**
   * Get all pending sales
   */
  const getPendingSales = useCallback(async () => {
    try {
      const pending = await salesDb.offline_sales_queue
        .where({ store_id: Number(storeId), synced: 0 })
        .toArray();
      return pending;
    } catch (error) {
      console.error('Error getting pending sales:', error);
      return [];
    }
  }, [storeId]);

  /**
   * Get a specific offline sale for editing
   */
  const getOfflineSale = useCallback(async (clientRef) => {
    try {
      const sale = await salesDb.offline_sales_queue
        .where({ client_ref: clientRef })
        .first();
      return sale || null;
    } catch (error) {
      console.error('Error getting offline sale:', error);
      return null;
    }
  }, []);

  /**
   * Update an offline sale (for editing before sync)
   */
  const updateOfflineSale = useCallback(async (clientRef, updates) => {
    try {
      const sale = await getOfflineSale(clientRef);
      if (sale && sale.synced === 0) {
        await salesDb.offline_sales_queue.update(sale.localId, {
          payload: { ...sale.payload, ...updates },
          updated_at: new Date().toISOString(),
        });
        toast.success('Offline sale updated');
        return { success: true };
      }
      return { success: false, error: 'Sale not found or already synced' };
    } catch (error) {
      console.error('Error updating offline sale:', error);
      return { success: false, error: error.message };
    }
  }, [getOfflineSale]);

  /**
   * Mark sale as synced
   */
  const markSynced = useCallback(async (clientRef) => {
    try {
      const sale = await salesDb.offline_sales_queue
        .where({ client_ref: clientRef })
        .first();

      if (sale) {
        await salesDb.offline_sales_queue.update(sale.localId, {
          synced: 1,
          synced_at: new Date().toISOString(),
        });
        await loadPendingCount();
      }
    } catch (error) {
      console.error('Error marking sale as synced:', error);
    }
  }, []);

  /**
   * Mark sale sync failure
   */
  const markSyncFailed = useCallback(async (clientRef, errorMessage) => {
    try {
      const sale = await salesDb.offline_sales_queue
        .where({ client_ref: clientRef })
        .first();

      if (sale) {
        await salesDb.offline_sales_queue.update(sale.localId, {
          sync_attempts: (sale.sync_attempts || 0) + 1,
          last_error: errorMessage,
          last_attempt_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error marking sync failure:', error);
    }
  }, []);

  /**
   * Clear sync queue
   */
  const clearQueue = useCallback(async () => {
    try {
      await salesDb.offline_sales_queue
        .where({ store_id: Number(storeId) })
        .delete();
      await loadPendingCount();
      toast.success('Sync queue cleared');
    } catch (error) {
      console.error('Error clearing queue:', error);
      toast.error('Failed to clear sync queue');
    }
  }, [storeId]);

  /**
   * Sync a single sale
   */
  const syncSingleSale = useCallback(async (offlineSale) => {
    const { payload, client_ref } = offlineSale;

    try {
      // Create sale group first
      const { data: saleGroup, error: groupError } = await SalesService.createSaleGroup({
        total_amount: payload.total_amount,
        payment_method: payload.payment_method,
        customer_id: payload.customer_id,
        email_receipt: payload.email_receipt,
      });

      if (groupError) throw new Error(groupError);

      // Create sale lines
      for (const line of payload.lines) {
        const { error: lineError } = await SalesService.createSaleLine(line, saleGroup.id);
        if (lineError) throw new Error(lineError);

        // Update inventory
        await SalesService.updateInventoryAfterSale(
          line.dynamic_product_id,
          line.quantity,
          Number(storeId)
        );
      }

      await markSynced(client_ref);
      return { success: true };
    } catch (error) {
      await markSyncFailed(client_ref, error.message);
      return { success: false, error: error.message };
    }
  }, [storeId, markSynced, markSyncFailed]);

  /**
   * Sync all pending sales
   */
  const syncAllPending = useCallback(async () => {
    if (!isOnline || syncPaused || isSyncing) {
      if (!isOnline) toast.warn('Cannot sync while offline');
      if (syncPaused) toast.info('Sync is paused');
      return { synced: 0, failed: 0 };
    }

    setIsSyncing(true);
    const pending = await getPendingSales();
    let synced = 0;
    let failed = 0;

    for (const sale of pending) {
      if (syncPaused) break;

      const result = await syncSingleSale(sale);
      if (result.success) {
        synced++;
        toast.success(`Synced sale ${synced}/${pending.length}`);
      } else {
        failed++;
        toast.error(`Failed to sync sale: ${result.error}`);
      }
    }

    setIsSyncing(false);
    setLastSyncTime(new Date().toISOString());

    if (synced > 0 && failed === 0) {
      toast.success(`All ${synced} sales synced successfully!`);
    } else if (synced > 0) {
      toast.warn(`Synced ${synced} sales, ${failed} failed`);
    }

    return { synced, failed };
  }, [isOnline, syncPaused, isSyncing, getPendingSales, syncSingleSale]);

  /**
   * Pause sync
   */
  const pauseSync = useCallback(() => {
    setSyncPaused(true);
    toast.info('Sync paused');
  }, []);

  /**
   * Resume sync
   */
  const resumeSync = useCallback(() => {
    setSyncPaused(false);
    toast.info('Sync resumed');
  }, []);

  /**
   * Initialize cache from server
   */
  const initializeCache = useCallback(async () => {
    if (!isOnline) return;

    try {
      // Fetch and cache products
      const { data: products } = await SalesService.fetchProducts(storeId);
      if (products.length > 0) {
        await cacheProducts(products);
      }

      // Fetch and cache inventory
      const { data: inventories } = await SalesService.fetchAllInventory(storeId);
      if (inventories.length > 0) {
        await cacheAllInventory(inventories);
      }

      await salesDb.sync_meta.put({
        key: 'last_cache_refresh',
        value: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error initializing cache:', error);
    }
  }, [isOnline, storeId, cacheProducts, cacheAllInventory]);

  return {
    // State
    isOnline,
    pendingCount,
    isSyncing,
    syncPaused,
    lastSyncTime,

    // Product cache
    cacheProduct,
    cacheProducts,
    getProductByBarcode,
    getProductById,

    // Inventory cache
    cacheInventory,
    cacheAllInventory,
    getInventory,
    updateCachedInventory,

    // Offline sales queue
    queueSale,
    getPendingSales,
    getOfflineSale,
    updateOfflineSale,
    markSynced,
    clearQueue,

    // Sync operations
    syncAllPending,
    syncSingleSale,
    pauseSync,
    resumeSync,

    // Initialization
    initializeCache,
  };
}