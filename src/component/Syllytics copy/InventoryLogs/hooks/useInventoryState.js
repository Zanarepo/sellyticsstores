/**
 * SwiftInventory - Inventory State Hook
 * Main state management for inventory operations
 */
import { useState, useEffect, useCallback } from 'react';

import inventoryService from '../services/inventoryServices';
import { offlineDB } from '../db/dexieDb';
import toast from 'react-hot-toast';

export default function useInventoryState() {
  const [storeId, setStoreId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [canAdjust, setCanAdjust] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Initialize identity
  useEffect(() => {
    const { storeId: sid, userEmail: email } = inventoryService.getIdentity();
    if (!sid || !email) {
      console.error('No store ID or user email found');
      return;
    }
    setStoreId(sid);
    setUserEmail(email);
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Back online! Syncing...');
    };
    const handleOffline = () => {
      setIsOnline(false);
      console.log('You are offline. Changes will sync when connected.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check permissions
  useEffect(() => {
    if (!storeId || !userEmail) return;

    const checkPerms = async () => {
      try {
        const perms = await inventoryService.checkPermissions(storeId, userEmail);
        setCanAdjust(perms.canAdjust);
        setCanDelete(perms.canDelete);
        setIsOwner(perms.isOwner);
      } catch (err) {
        console.error('Permission check failed:', err);
      }
    };

    checkPerms();
  }, [storeId, userEmail]);

  // Fetch inventory
  const fetchInventory = useCallback(async () => {
    if (!storeId) return;

    setLoading(true);

    try {
      if (isOnline) {
        // Fetch from Supabase
        const [invData, prodData] = await Promise.all([
          inventoryService.fetchInventory(storeId),
          inventoryService.fetchProducts(storeId)
        ]);

        setInventory(invData);
        setProducts(prodData);

        // Cache locally
        await offlineDB.cacheInventory(invData, storeId);
        await offlineDB.cacheProducts(prodData, storeId);
      } else {
        // Load from cache
        const [cachedInv, cachedProd] = await Promise.all([
          offlineDB.getCachedInventory(storeId),
          offlineDB.getCachedProducts(storeId)
        ]);

        setInventory(cachedInv);
        setProducts(cachedProd);
      }
    } catch (err) {
      console.error('Fetch inventory failed:', err);
      
      // Fallback to cache
      const [cachedInv, cachedProd] = await Promise.all([
        offlineDB.getCachedInventory(storeId),
        offlineDB.getCachedProducts(storeId)
      ]);

      if (cachedInv.length > 0) {
        setInventory(cachedInv);
        setProducts(cachedProd);
        console.log('Showing cached data');
      } else {
        console.error('Failed to load inventory');
      }
    }

    setLoading(false);
  }, [storeId, isOnline]);

  // Initial fetch
  useEffect(() => {
    if (storeId) fetchInventory();
  }, [storeId, fetchInventory]);

  // Update inventory quantity
  const updateQuantity = useCallback(async (inventoryId, productId, newQty, reason) => {
    if (!canAdjust) {
      console.error('You do not have permission to adjust inventory');
      return false;
    }

    try {
      if (isOnline) {
        await inventoryService.updateInventoryQty(inventoryId, newQty, productId, storeId, reason);
        console.log('Inventory updated');
      } else {
        // Queue for offline sync
        await offlineDB.queueInventoryUpdate(productId, storeId, { available_qty: newQty, reason });
        await offlineDB.updateCachedInventory(productId, storeId, newQty);
        console.log('Update saved offline');
      }

      // Update local state
      setInventory(prev => prev.map(item => 
        item.id === inventoryId 
          ? { ...item, available_qty: newQty }
          : item
      ));

      return true;
    } catch (err) {
      console.error(err.message || 'Failed to update inventory');
      return false;
    }
  }, [storeId, isOnline, canAdjust]);





  // Add IMEI (unique products)
  const addImei = useCallback(async (productId, imei) => {
    if (!canAdjust) {
      console.error('You do not have permission to adjust inventory');
      return false;
    }

    try {
      if (isOnline) {
        await inventoryService.addImei(productId, imei, storeId);
        console.log('IMEI added');
        await fetchInventory();
      } else {
        await offlineDB.queueImeiUpdate('add', productId, imei, storeId);
        console.log('IMEI saved offline');
      }
      return true;
    } catch (err) {
      console.error(err.message || 'Failed to add IMEI');
      return false;
    }
  }, [storeId, isOnline, canAdjust, fetchInventory]);





  // Remove IMEI
  const removeImei = useCallback(async (productId, imei) => {
    if (!canAdjust) {
      console.error('You do not have permission to adjust inventory');
      return false;
    }

    try {
      if (isOnline) {
        await inventoryService.removeImei(productId, imei, storeId);
        console.log('IMEI removed');
        await fetchInventory();
      } else {
        await offlineDB.queueImeiUpdate('remove', productId, imei, storeId);
        console.log('Removal saved offline');
      }
      return true;
    } catch (err) {
      console.error(err.message || 'Failed to remove IMEI');
      return false;
    }
  }, [storeId, isOnline, canAdjust, fetchInventory]);

  // Delete product
  const deleteProduct = useCallback(async (productId) => {
    if (!canDelete) {
      console.error('You do not have permission to delete products');
      return false;
    }

    try {
      if (isOnline) {
        await inventoryService.deleteProduct(productId);
        console.log('Product deleted');
        await fetchInventory();
      } else {
        console.error('Cannot delete while offline');
        return false;
      }
      return true;
    } catch (err) {
      console.error(err.message || 'Failed to delete product');
      return false;
    }
  }, [isOnline, canDelete, fetchInventory]);

  // Update product
  const updateProduct = useCallback(async (productId, data) => {
    if (!canAdjust) {
      console.error('You do not have permission to edit products');
      return false;
    }

    try {
      if (isOnline) {
        await inventoryService.updateProduct(productId, data);
        console.log('Product updated');
        await fetchInventory();
      } else {
        console.error('Cannot update product details while offline');
        return false;
      }
      return true;
    } catch (err) {
      console.error(err.message || 'Failed to update product');
      return false;
    }
  }, [isOnline, canAdjust, fetchInventory]);

  // Restock
  const restockProduct = useCallback(async (productId, qty, reason) => {
    if (!canAdjust) {
      console.error('You do not have permission to restock');
      return false;
    }

    try {
      if (isOnline) {
        await inventoryService.restockProduct(productId, storeId, qty, reason);
        console.log(`Restocked ${qty} units`);
        await fetchInventory();
      } else {
        const item = inventory.find(i => i.dynamic_product_id === productId);
        if (item) {
          const newQty = item.available_qty + qty;
          await offlineDB.queueInventoryUpdate(productId, storeId, { available_qty: newQty, reason });
          await offlineDB.updateCachedInventory(productId, storeId, newQty);
          setInventory(prev => prev.map(i => 
            i.dynamic_product_id === productId 
              ? { ...i, available_qty: newQty }
              : i
          ));
          console.log('Restock saved offline');
        }
      }
      return true;
    } catch (err) {
      console.error(err.message || 'Failed to restock');
      return false;
    }
  }, [storeId, isOnline, canAdjust, inventory, fetchInventory]);

  // Get product by barcode
  const getProductByBarcode = useCallback((barcode) => {
    return inventoryService.getProductByBarcode(products, barcode);
  }, [products]);

// in useInventoryState.js or parent
const handleAdjustStock = async (itemId, adjustment, reason = 'Inventory count') => {
  try {
    const item = inventory.find(i => i.id === itemId);
    if (!item) throw new Error('Item not found');

    const newQty = item.available_qty + adjustment;
    if (newQty < 0) {
      toast.error('Cannot reduce below 0');
      return false;
    }

    const success = await updateQuantity(item.id, item.dynamic_product_id, newQty, reason);

    if (success) {
      toast.success(`Stock updated: ${item.available_qty} → ${newQty}`);
    }
    return success;
  } catch (err) {
    console.error('Error adjusting stock:', err.message);
    toast.error(err.message || 'Failed to adjust stock');
    return false;
  }
};

  

  
  return {
    storeId,
    userEmail,
    inventory,
    products,
    loading,
    isOnline,
    canAdjust,
    canDelete,
    isOwner,
    fetchInventory,
    updateQuantity,
    addImei,
    handleAdjustStock,
    removeImei,
    deleteProduct,
    updateProduct,
    restockProduct,
    getProductByBarcode,
    setInventory
  };
}