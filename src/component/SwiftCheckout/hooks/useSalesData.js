/**
 * SwiftCheckout - Sales Data Hook
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '../../../supabaseClient';
import { productCache, inventoryCache } from '../db/offlineDb';

export default function useSalesData(storeId, userEmail) {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    if (!storeId) return;
    try {
      const { data, error } = await supabase
        .from('dynamic_product')
        .select('*')
        .eq('store_id', storeId)
        .order('name', { ascending: true });

      if (error) throw error;

      const processedProducts = (data || []).map(p => ({
        ...p,
        deviceIds: p.dynamic_product_imeis?.split(',').filter(Boolean) || [],
        deviceSizes: p.device_size?.split(',').filter(Boolean) || [],
      }));

      setProducts(processedProducts);
      await productCache.cacheProducts(processedProducts);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      // Try cache
      const cached = await productCache.getAllForStore(storeId);
      setProducts(cached);
    }
  }, [storeId]);

  // Fetch Inventory
  const fetchInventory = useCallback(async () => {
    if (!storeId) return;
    try {
      const { data, error } = await supabase
        .from('dynamic_inventory')
        .select('*')
        .eq('store_id', storeId);

      if (error) throw error;
      setInventory(data || []);
      await inventoryCache.cacheInventories(data || []);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      const cached = await inventoryCache.getAllForStore(storeId);
      setInventory(cached);
    }
  }, [storeId]);

  // Fetch Sales
  const fetchSales = useCallback(async () => {
    if (!storeId || !userEmail) {
      setSales([]);
      setFiltered([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Check if owner
      const { data: storeOwner } = await supabase
        .from('stores')
        .select('id')
        .eq('id', storeId)
        .eq('email_address', userEmail)
        .maybeSingle();

      let query = supabase
        .from('dynamic_sales')
        .select(`
          *,
          dynamic_product:dynamic_product(id, name),
          customer:customer(fullname),
          sale_store:store_id(shop_name)
        `)
        .eq('store_id', storeId)
        .order('sold_at', { ascending: false });

      if (storeOwner) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
        const { data: storeUser } = await supabase
          .from('store_users')
          .select('id')
          .eq('store_id', storeId)
          .eq('email_address', userEmail)
          .maybeSingle();

        if (storeUser) {
          query = query.eq('created_by_user_id', storeUser.id);
        } else {
          setSales([]);
          setFiltered([]);
          setIsLoading(false);
          return;
        }
      }

      const { data: salesData, error } = await query;

      if (error) throw error;

      const processedSales = (salesData || []).map(s => ({
        ...s,
        product_name: s.dynamic_product?.name || s.product_name || 'Unknown Product',
        customer_name: s.customer?.fullname || 'Walk-in',
        deviceIds: s.device_id?.split(',').filter(Boolean) || [],
        deviceSizes: s.device_size?.split(',').filter(Boolean) || [],
      }));

      setSales(processedSales);
      setFiltered(processedSales);
    } catch (err) {
      console.error('Failed to fetch sales:', err);
      setSales([]);
      setFiltered([]);
    } finally {
      setIsLoading(false);
    }
  }, [storeId, userEmail]);

  // Search filter
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(sales);
      return;
    }

    const q = search.toLowerCase();
    setFiltered(
      sales.filter(s =>
        s.product_name?.toLowerCase().includes(q) ||
        s.customer_name?.toLowerCase().includes(q) ||
        s.payment_method?.toLowerCase().includes(q) ||
        s.deviceIds?.some(id => id.toLowerCase().includes(q))
      )
    );
  }, [search, sales]);

  // Initial load
  useEffect(() => {
    fetchProducts();
    fetchInventory();
    fetchSales();
  }, [fetchProducts, fetchInventory, fetchSales]);

  // Daily & Weekly totals
 // Inside useSalesData.js – replace the dailyTotals & weeklyTotals useMemo

const dailyTotals = useMemo(() => {
  const groups = {};

  sales.forEach((s) => {
    // THIS IS THE ONLY CHANGE – safe parsing
    if (!s?.sold_at) return;                          // skip if missing
    const date = new Date(s.sold_at);
    if (isNaN(date.getTime())) return;                // skip invalid dates

    const key = date.toISOString().split("T")[0];

    groups[key] = groups[key] || { period: key, total: 0, count: 0 };
    groups[key].total += Number(s.amount) || 0;
    groups[key].count += 1;
  });

  return Object.values(groups).sort((a, b) => b.period.localeCompare(a.period));
}, [sales]);

const weeklyTotals = useMemo(() => {
  const groups = {};

  sales.forEach((s) => {
    if (!s?.sold_at) return;
    const date = new Date(s.sold_at);
    if (isNaN(date.getTime())) return;                // skip invalid dates

    // Monday of the week
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);

    const key = start.toISOString().split("T")[0];

    groups[key] = groups[key] || { period: `Week of ${key}`, total: 0, count: 0 };
    groups[key].total += Number(s.amount) || 0;
    groups[key].count += 1;
  });

  return Object.values(groups).sort((a, b) => {
    const aKey = a.period.replace("Week of ", "");
    const bKey = b.period.replace("Week of ", "");
    return bKey.localeCompare(aKey);
  });
}, [sales]);
  return {
    products,
    inventory,
    sales,
    filtered,
    search,
    setSearch,
    isLoading,
    dailyTotals,
    weeklyTotals,
    fetchProducts,
    fetchInventory,
    fetchSales,
    isOwner,
    setInventory,
    setSales,
  };
}