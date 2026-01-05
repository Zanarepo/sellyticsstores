/**
 * SwiftInventory - useInventoryData Hook
 * Main hook for fetching and managing inventory data
 */

import { supabase } from '../../../../supabaseClient';
import { useState, useEffect, useCallback } from 'react';
import inventoryService from '../services/inventoryServices';
import * as inventoryCache from '../../db/inventoryCache';
import * as productCache from '../../db/productCache';
import * as customerCache from '../../db/customerCache';
import toast from 'react-hot-toast';

export default function useInventoryData() {
  const [storeId, setStoreId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Permissions
  const [isOwner, setIsOwner] = useState(false);
  const [canAdjust, setCanAdjust] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  // -------------------------
  // Initialize store and user
  // -------------------------
  useEffect(() => {
    const sid = localStorage.getItem('store_id');
    const email = (localStorage.getItem('user_email') || '').trim().toLowerCase();

    if (sid) setStoreId(parseInt(sid));
    if (email) setUserEmail(email);

    // Online/offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // -------------------------
  // Check permissions
  // -------------------------
  useEffect(() => {
    if (!storeId || !userEmail) return;

    const checkPerms = async () => {
      try {
        const perms = await inventoryService.checkPermissions(storeId, userEmail);
        setIsOwner(perms.isOwner);
        setCanAdjust(perms.canAdjust);
        setCanDelete(perms.canDelete);
      } catch (err) {
        console.error('Permission check failed:', err);
      }
    };

    checkPerms();
  }, [storeId, userEmail]);

  // -------------------------
  // Fetch inventory and cache
  // -------------------------
  const fetchInventory = useCallback(async () => {
    if (!storeId) return;

    setLoading(true);

    try {
      if (isOnline) {
        // Fetch from Supabase
        const [inv, prods, custs] = await Promise.all([
          inventoryService.fetchInventory(storeId),
          inventoryService.fetchProducts(storeId),
          inventoryService.fetchCustomers(storeId)
        ]);

        setInventory(inv);
        setProducts(prods);
        setCustomers(custs);

        // Cache for offline use
        await Promise.all([
          inventoryCache.cacheInventories(inv, storeId),
          productCache.cacheProducts(prods, storeId),
          customerCache.cacheCustomers(custs, storeId)
        ]);
      } else {
        // Fetch from cache
        const [cachedInv, cachedProds, cachedCusts] = await Promise.all([
          inventoryCache.getAllInventory(storeId),
          productCache.getAllProducts(storeId),
          customerCache.getAllCustomers(storeId)
        ]);

        setInventory(cachedInv);
        setProducts(cachedProds);
        setCustomers(cachedCusts);

        if (cachedInv.length === 0) {
          toast.error('No cached data available offline');
        }
      }
    } catch (err) {
      console.error('Fetch inventory failed:', err);

      // Try cache as fallback
      try {
        const [cachedInv, cachedProds] = await Promise.all([
          inventoryCache.getAllInventory(storeId),
          productCache.getAllProducts(storeId)
        ]);

        setInventory(cachedInv);
        setProducts(cachedProds);
        toast.error('Using cached data due to connection error');
      } catch (cacheErr) {
        toast.error('Failed to load inventory data');
      }
    }

    setLoading(false);
  }, [storeId, isOnline]);

  // -------------------------
  // Initial fetch
  // -------------------------
  useEffect(() => {
    if (storeId) fetchInventory();
  }, [storeId, fetchInventory]);

  // -------------------------
  // Real-time subscription
  // -------------------------
  useEffect(() => {
    if (!storeId || !isOnline) return;

    const channel = supabase
      .channel(`inventory-${storeId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dynamic_inventory', filter: `store_id=eq.${storeId}` },
        () => fetchInventory()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dynamic_product', filter: `store_id=eq.${storeId}` },
        () => fetchInventory()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [storeId, isOnline, fetchInventory]);

  // -------------------------
  // Helper functions
  // -------------------------
  const getProductById = useCallback(
    (productId) => products.find(p => p.id === productId) || null,
    [products]
  );

  const getInventoryForProduct = useCallback(
    (productId) => inventory.find(i => i.dynamic_product_id === productId) || null,
    [inventory]
  );

  const getProductByBarcode = useCallback(
    (barcode) => {
      const normalized = barcode.trim().toLowerCase();

      return products.find(p => {
        if (p.barcode?.toLowerCase() === normalized) return true;
        if (p.dynamic_product_imeis) {
          const imeis = p.dynamic_product_imeis.split(',').map(i => i.trim().toLowerCase());
          if (imeis.includes(normalized)) return true;
        }
        return false;
      }) || null;
    },
    [products]
  );

  // -------------------------
  // Return API
  // -------------------------
  return {
    storeId,
    userEmail,
    inventory,
    products,
    customers,
    loading,
    isOnline,
    isOwner,
    canAdjust,
    canDelete,
    fetchInventory,
    getProductById,
    getInventoryForProduct,
    getProductByBarcode,
    setInventory
  };
}
