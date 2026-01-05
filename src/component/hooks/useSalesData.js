/**
 * Sales Data Hook with Offline-First Support
 * @version 2.0.0
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../../supabaseClient';
import offlineCache from '../db/offlineCache';

export default function useSalesData(storeId, userEmail) {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isOwner, setIsOwner] = useState(false);
  const [storeUserId, setStoreUserId] = useState(null);
  const [search, setSearch] = useState('');

  // Network monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Process product data
  const processProduct = (p) => ({
    ...p,
    deviceIds: p.dynamic_product_imeis?.split(',').map(i => i.trim()).filter(Boolean) || [],
    deviceSizes: p.device_size?.split(',').map(s => s.trim()).filter(Boolean) || [],
    quickScanBarcode: p.device_id?.trim() || null,
    isQuickScanItem: !!p.device_id && !p.is_unique
  });

  // Fetch with fallback
  const fetchWithFallback = useCallback(async (
    tableName,
    query,
    cacheGetter,
    cacheSetter,
    processor = (d) => d
  ) => {
    try {
      if (isOnline) {
        const { data, error } = await query;
        if (error) throw error;
        const processed = data.map(processor);
        await cacheSetter(processed, storeId);
        return processed;
      }
    } catch (err) {
      console.error(`Failed to fetch ${tableName}:`, err);
    }
    
    // Fallback to cache
    const cached = await cacheGetter(storeId);
    return cached.map(processor);
  }, [isOnline, storeId]);

  // Check permissions
  const checkPermissions = useCallback(async () => {
    if (!storeId || !userEmail) return;
    
    try {
      const { data: storeData } = await supabase
        .from('stores')
        .select('id')
        .eq('id', storeId)
        .eq('email_address', userEmail.toLowerCase())
        .maybeSingle();
      
      setIsOwner(!!storeData);
      
      if (!storeData) {
        const { data: userData } = await supabase
          .from('store_users')
          .select('id')
          .eq('store_id', storeId)
          .eq('email_address', userEmail.toLowerCase())
          .maybeSingle();
        
        setStoreUserId(userData?.id || null);
      }
    } catch (err) {
      console.error('Permission check failed:', err);
    }
  }, [storeId, userEmail]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    const data = await fetchWithFallback(
      'products',
      supabase.from('dynamic_product').select('*').eq('store_id', storeId).order('name'),
      offlineCache.getAllProducts,
      offlineCache.cacheProducts,
      processProduct
    );
    setProducts(data);
  }, [storeId, fetchWithFallback]);

  // Fetch inventory
  const fetchInventory = useCallback(async () => {
    const data = await fetchWithFallback(
      'inventory',
      supabase.from('dynamic_inventory').select('*').eq('store_id', storeId),
      async () => [], // No direct cache getter for all inventory
      offlineCache.cacheInventories
    );
    setInventory(data);
  }, [storeId, fetchWithFallback]);

  // Fetch sales
  const fetchSales = useCallback(async () => {
    try {
      if (isOnline) {
        let query = supabase
          .from('dynamic_sales')
          .select(`*, dynamic_product:dynamic_product(name)`)
          .eq('store_id', storeId)
          .order('sold_at', { ascending: false });
        
        if (!isOwner && storeUserId) {
          query = query.eq('created_by_user_id', storeUserId);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        const processed = data.map(s => ({
          ...s,
          product_name: s.dynamic_product?.name || 'Unknown',
          _synced: true
        }));
        
        // Merge with pending offline sales
        const offline = await offlineCache.getPendingSales(storeId);
        setSales([...offline, ...processed]);
      } else {
        const cached = await offlineCache.getAllSales(storeId);
        setSales(cached);
      }
    } catch (err) {
      const cached = await offlineCache.getAllSales(storeId);
      setSales(cached);
    }
  }, [storeId, isOnline, isOwner, storeUserId]);

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    const data = await fetchWithFallback(
      'customers',
      supabase.from('customer').select('id, fullname, email, phone').eq('store_id', storeId).order('fullname'),
      offlineCache.getAllCustomers,
      offlineCache.cacheCustomers
    );
    setCustomers(data);
  }, [storeId, fetchWithFallback]);

  // Fetch all
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      checkPermissions(),
      fetchProducts(),
      fetchInventory(),
      fetchSales(),
      fetchCustomers()
    ]);
    setIsLoading(false);
  }, [checkPermissions, fetchProducts, fetchInventory, fetchSales, fetchCustomers]);

  // Refresh
  const refreshData = useCallback(async () => {
    if (!isOnline) {
      toast.info('Cannot refresh offline');
      return;
    }
    await fetchAllData();
    toast.success('Data refreshed');
  }, [isOnline, fetchAllData]);

  // Initial load
  useEffect(() => {
    if (storeId && userEmail) fetchAllData();
  }, [storeId, userEmail, fetchAllData]);

  // Filtered sales
  const filteredSales = useMemo(() => {
    if (!search.trim()) return sales;
    const q = search.toLowerCase();
    return sales.filter(s =>
      s.product_name?.toLowerCase().includes(q) ||
      s.customer_name?.toLowerCase().includes(q) ||
      s.device_id?.toLowerCase().includes(q)
    );
  }, [sales, search]);

  // Helpers
  const getInventoryForProduct = useCallback((productId) =>
    inventory.find(inv => inv.dynamic_product_id === Number(productId)),
  [inventory]);

  const getProductByBarcode = useCallback((barcode) => {
    if (!barcode) return null;
    const normalized = barcode.trim().toLowerCase();
    return products.find(p =>
      p.quickScanBarcode?.toLowerCase() === normalized ||
      p.deviceIds?.some(id => id.toLowerCase() === normalized)
    );
  }, [products]);

  return {
    products,
    inventory,
    sales,
    customers,
    filteredSales,
    isLoading,
    isOnline,
    isOwner,
    storeUserId,
    search,
    setSearch,
    setSales,
    fetchProducts,
    fetchInventory,
    fetchSales,
    fetchAllData,
    refreshData,
    getInventoryForProduct,
    getProductByBarcode
  };
}