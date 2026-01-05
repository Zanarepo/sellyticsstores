/**
 * SwiftCheckout - Offline Cache Hook
 */
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { productCache, inventoryCache, offlineSalesQueue, syncStatusManager } from '../db/offlineDb';
import { fetchProducts, fetchInventory } from '../services/salesServices';
import { syncAllPendingSales, isOnline as checkOnline, setupAutoSync } from '../services/syncServices';
import { getCurrentUser } from '../utils/identity';

export default function useOfflineCache() {
  const [isOnline, setIsOnline] = useState(checkOnline());
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [products, setProducts] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { storeId } = getCurrentUser();
const [pendingSales, setPendingSales] = useState([]);// ← ADD if needed



  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warn('You are offline');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  

 

const loadSyncStatus = useCallback(async () => {
  // ←←← THIS LINE FIXES EVERYTHING
  if (!storeId) {
    setPendingCount(0);
    setIsPaused(false);
    setLastSyncAt(null);
    return;
  }

  try {
    const count = await offlineSalesQueue.getPendingCount(storeId);
    setPendingCount(count || 0);

    const status = await syncStatusManager.getStatus();
    setIsPaused(!!status.isPaused);
    setLastSyncAt(status.lastSyncAt || null);
  } catch (error) {
    console.warn("Failed to load sync status (probably offline/first load)", error);
    setPendingCount(0);
  }
}, [storeId]);





  // Load products and inventory
  const loadData = useCallback(async () => {
    if (!storeId) return;
    
    setIsLoading(true);
    
    try {
      // Try to fetch from server if online
      if (isOnline) {
        const [productsResult, inventoryResult] = await Promise.all([
          fetchProducts(storeId),
          fetchInventory(storeId)
        ]);
        
        if (productsResult.success) {
          setProducts(productsResult.products);
        }
        
        if (inventoryResult.success) {
          setInventories(inventoryResult.inventories);
        }
      } else {
        // Load from cache
        const cachedProducts = await productCache.getAllForStore(storeId);
        const cachedInventories = await inventoryCache.getAllForStore(storeId);
        
        setProducts(cachedProducts);
        setInventories(cachedInventories);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      
      // Fallback to cache
      const cachedProducts = await productCache.getAllForStore(storeId);
      const cachedInventories = await inventoryCache.getAllForStore(storeId);
      
      setProducts(cachedProducts);
      setInventories(cachedInventories);
    }
    
    setIsLoading(false);
  }, [storeId, isOnline]);
  
 
  // Auto-sync when coming online
  useEffect(() => {
  if (!storeId) return;

  const cleanup = setupAutoSync(storeId, (result) => {
    loadSyncStatus();
    loadData();
    if (result.synced > 0) {
      toast.success(`Synced ${result.synced} sale${result.synced > 1 ? 's' : ''}`);
    }
  });

  return cleanup;
}, [storeId, loadSyncStatus, loadData]);



  // Get product by barcode
  const getProductByBarcode = useCallback(async (barcode) => {
    return productCache.getByBarcode(barcode, storeId);
  }, [storeId]);
  
  // Get product by ID
  const getProductById = useCallback(async (productId) => {
    return productCache.getById(productId);
  }, []);
  
  // Get inventory for product
  const getInventory = useCallback(async (productId) => {
    return inventoryCache.getByProductId(productId, storeId);
  }, [storeId]);
  

const refreshPendingSales = useCallback(async () => {
  if (!storeId) {
    setPendingSales([]);
    return;
  }
  try {
    const sales = await offlineSalesQueue.getPendingSales(storeId);
    setPendingSales(sales);
  } catch (err) {
    console.warn("Failed to refresh pending sales", err);
    setPendingSales([]);
  }
}, [storeId]);

// Call on mount + when storeId changes
  // Initial load
  useEffect(() => {
    loadData();
    loadSyncStatus();
  }, [loadData, loadSyncStatus]);

useEffect(() => {
  refreshPendingSales();
}, [refreshPendingSales]);
  



// NOW YOUR UPDATED queueSale (fully working)
const queueSale = useCallback(async (salePayload) => {
  if (!storeId) {
    console.error("Cannot queue sale: storeId is missing");
    toast.error("Store not loaded. Please refresh.");
    throw new Error("Missing storeId");
  }

  try {
    const result = await offlineSalesQueue.queueSale({
      ...salePayload,
      store_id: Number(storeId),
      sold_at: new Date().toISOString(),
      synced: false,
      totalAmount: salePayload.totalAmount || salePayload.amount || 0,
      paymentMethod: salePayload.paymentMethod || salePayload.payment_method || "Cash",
      lines: salePayload.lines || [],
    });

    // INSTANT UI UPDATE — no page refresh needed!
    await loadSyncStatus();        // updates pendingCount
    await refreshPendingSales();   // updates pendingSales list → full details appear instantly

    toast.success("Sale saved offline");
    return result;
  } catch (error) {
    console.error("Failed to queue offline sale:", error);
    toast.error("Failed to save sale offline");
    throw error;
  }
}, [storeId, loadSyncStatus, refreshPendingSales]);






  // Edit offline sale
  const editOfflineSale = useCallback(async (localId, updates) => {
    await offlineSalesQueue.updateSale(localId, updates);
    await loadSyncStatus();
  }, [loadSyncStatus]);
  




  // Delete offline sale
  const deleteOfflineSale = useCallback(async (localId) => {
    await offlineSalesQueue.deleteSale(localId);
    await loadSyncStatus();
    toast.info('Offline sale removed');
  }, [loadSyncStatus]);
  



  
  // Sync all pending
  const syncAll = useCallback(async (onProgress = null) => {
    if (!isOnline) {
      toast.warn('Cannot sync while offline');
      return { synced: 0, failed: 0 };
    }
    
    setIsSyncing(true);
    
    try {
      const result = await syncAllPendingSales(storeId, onProgress);
      await loadSyncStatus();
      await loadData();
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, [storeId, isOnline, loadSyncStatus, loadData]);
  





  // Pause sync
  const pauseSync = useCallback(async () => {
    await syncStatusManager.setPaused(true);
    setIsPaused(true);
    toast.info('Sync paused');
  }, []);
  



  // Resume sync
  const resumeSync = useCallback(async () => {
    await syncStatusManager.setPaused(false);
    setIsPaused(false);
    toast.info('Sync resumed');
  }, []);
  



  // Clear queue
  const clearQueue = useCallback(async () => {
    await offlineSalesQueue.clearQueue(storeId);
    await loadSyncStatus();
    toast.info('Queue cleared');
  }, [storeId, loadSyncStatus]);
  



  // Get pending sales
const getPendingSales = useCallback(async () => {
  const rawSales = await offlineSalesQueue.getPendingSales(storeId);

  // THIS IS THE MAGIC — converts old/corrupted format → UI-friendly format
  return rawSales.map(sale => {
    const lines = [];

    // If new format (has lines array) → use it
    if (Array.isArray(sale.lines) && sale.lines.length > 0) {
      lines.push(...sale.lines);
    }
    // If old format (flat fields like dynamic_product_id, amount) → convert
    else if (sale.dynamic_product_id || sale.amount) {
      lines.push({
        productId: sale.dynamic_product_id,
        productName: sale.product_name || 'Cement',
        quantity: Number(sale.quantity) || 1,
        unitPrice: Number(sale.unit_price || sale.amount),
        totalPrice: Number(sale.amount || 0),
      });
    }

    const totalAmount = lines.reduce((sum, line) => sum + (line.totalPrice || line.unitPrice * line.quantity), 0)
                     || Number(sale.amount || sale.totalAmount || 0);

    return {
      ...sale,
      client_ref: sale.client_ref,
      lines,
      totalAmount,
      paymentMethod: sale.paymentMethod || sale.payment_method || 'Cash',
      store_id: Number(sale.store_id), // ensure store_id is number
    };
  });
}, [storeId]);



  // Update local inventory
  const updateLocalInventory = useCallback(async (productId, qtyChange) => {
    await inventoryCache.updateLocalQty(productId, storeId, qtyChange);
    const updated = await inventoryCache.getAllForStore(storeId);
    setInventories(updated);
  }, [storeId]);
  


  // Refresh from server
  const refresh = useCallback(async () => {
    await loadData();
    await loadSyncStatus();
  }, [loadData, loadSyncStatus]);
  


  return {
    // Status
    isOnline,
    isLoading,
    isSyncing,
    isPaused,
    pendingCount,
    lastSyncAt,
    

    
    // Data
    products,
    inventories,
    
    // Cache operations
    getProductByBarcode,
    getProductById,
    getInventory,
    
    // Offline queue
    queueSale,
    editOfflineSale,
    deleteOfflineSale,
    getPendingSales,
    pendingSales,        // ← the actual list of offline sales
  refreshPendingSales,
    // Sync operations
    syncAll,
    pauseSync,
    resumeSync,
    clearQueue,
    
    // Local inventory
    updateLocalInventory,
    
    // Refresh
    refresh
  };
}