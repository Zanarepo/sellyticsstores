/**
 * SwiftCheckout - Data Loader Hook
 * Handles loading and caching of products, inventory, customers
 * @version 1.0.0
 */
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import offlineCache from '../db/offlineCache';
import salesService from '../Sales/services/salesService';
import { getIdentity } from '../services/identityService';

export default function useDataLoader() {
  const { currentStoreId, isValid } = getIdentity();

  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [pendingSales, setPendingSales] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (!isValid) {
      setError('Invalid store ID');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const isOnline = navigator.onLine;

      if (isOnline) {
        // 1. Fetch all data from Supabase first
        const [
          productsData,
          inventoryData,
          customersData,
          salesData,
          ownerStatus
        ] = await Promise.all([
          salesService.getProducts(),
          salesService.getInventory(),
          salesService.getCustomers(),
          salesService.getSales(),
          salesService.checkIsOwner()
        ]);

        // 2. Now cache everything (including sales!)
        await Promise.all([
          offlineCache.cacheProducts(productsData, currentStoreId),
          offlineCache.cacheInventories(inventoryData, currentStoreId),
          offlineCache.cacheCustomers(customersData, currentStoreId),
          offlineCache.cacheSales(salesData, currentStoreId)  // ← Now in correct order
        ]);

        // 3. Update state
        setProducts(productsData);
        setInventory(inventoryData);
        setCustomers(customersData);
        setSales(salesData);
        setIsOwner(ownerStatus);
      } else {
        // Offline: load from local cache
        const [
          cachedProducts,
          cachedInventory,
          cachedCustomers,
          cachedSales
        ] = await Promise.all([
          offlineCache.getAllProducts(currentStoreId),
          offlineCache.getAllInventory(currentStoreId),
          offlineCache.getAllCustomers(currentStoreId),
          offlineCache.getAllSales(currentStoreId)
        ]);

        const ownerStatus = await offlineCache.isStoreOwner(
          currentStoreId,
          getIdentity().currentUserEmail
        );

        setProducts(cachedProducts);
        setInventory(cachedInventory);
        setCustomers(cachedCustomers);
        setSales(cachedSales);
        setIsOwner(ownerStatus);
      }

      // Always load pending sales (offline-created but not synced)
      const pending = await offlineCache.getPendingSales(currentStoreId);
      setPendingSales(pending);

    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err.message);

      // Fallback: try loading from cache even if online failed
      try {
        const [
          cachedProducts,
          cachedInventory,
          cachedCustomers,
          cachedSales
        ] = await Promise.all([
          offlineCache.getAllProducts(currentStoreId),
          offlineCache.getAllInventory(currentStoreId),
          offlineCache.getAllCustomers(currentStoreId),
          offlineCache.getAllSales(currentStoreId)
        ]);

        setProducts(cachedProducts);
        setInventory(cachedInventory);
        setCustomers(cachedCustomers);
        setSales(cachedSales);

        toast.info('Loaded from offline cache');
      } catch (cacheErr) {
        console.error('Cache fallback failed:', cacheErr);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentStoreId, isValid]);


  // Refresh data
  const refreshData = useCallback(async () => {
    toast.info('Refreshing data...');
    await loadData();
    toast.success('Data refreshed');
  }, [loadData]);


  const refreshSales = useCallback(async () => {
    if (!isValid) return;

    try {
      let currentSales = [];

      if (navigator.onLine) {
        // Re-fetch fresh from Supabase
        const freshSales = await salesService.getSales();

        // IMPORTANT: Re-cache the fresh sales locally (updates edited ones)
        await offlineCache.cacheSales(freshSales, currentStoreId);

        currentSales = freshSales;
      } else {
        // Offline: load all from local DB
        currentSales = await offlineCache.getAllSales(currentStoreId);
      }

      // Always get latest pending (unsynced creates/edits)
      const pending = await offlineCache.getPendingSales(currentStoreId);

      // Merge: synced (or fresh) + pending
      const merged = [...currentSales, ...pending];

      setSales(merged);
      setPendingSales(pending);

    } catch (err) {
      console.error('Failed to refresh sales:', err);
      toast.error('Failed to update sales list');
    }
  }, [currentStoreId, isValid]);



  // Refresh inventory only
  const refreshInventory = useCallback(async () => {
    if (!isValid) return;

    try {
      if (navigator.onLine) {
        const inventoryData = await salesService.getInventory();
        await offlineCache.cacheInventories(inventoryData, currentStoreId);
        setInventory(inventoryData);
      } else {
        const cachedInventory = await offlineCache.getAllInventory(currentStoreId);
        setInventory(cachedInventory);
      }
    } catch (err) {
      console.error('Failed to refresh inventory:', err);
    }
  }, [currentStoreId, isValid]);






  // Get product by ID
  const getProductById = useCallback((productId) => {
    return products.find(p => p.id === productId);
  }, [products]);

  // Get product by barcode
  const getProductByBarcode = useCallback((barcode) => {
    if (!barcode) return null;
    const normalized = barcode.trim().toLowerCase();

    // Check device_id
    let match = products.find(p =>
      p.device_id?.trim().toLowerCase() === normalized
    );
    if (match) return match;

    // Check IMEI list
    match = products.find(p => {
      const imeis = p.dynamic_product_imeis?.split(',').map(i => i.trim().toLowerCase()) || [];
      return imeis.includes(normalized);
    });

    return match || null;
  }, [products]);

  // Get inventory for product
  const getInventoryForProduct = useCallback((productId) => {
    return inventory.find(i => i.dynamic_product_id === productId);
  }, [inventory]);

  // Get customer by ID
  const getCustomerById = useCallback((customerId) => {
    return customers.find(c => c.id === customerId);
  }, [customers]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    // Data
    products,
    inventory,
    customers,
    sales,
    pendingSales,
    isOwner,
    isLoading,
    error,

    // Actions
    refreshData,
    refreshSales,
    refreshInventory,
    loadData,

    // Helpers
    getProductById,
    getProductByBarcode,
    getInventoryForProduct,
    getCustomerById,

    // Setters for external updates
    setSales,
    setPendingSales
  };
}