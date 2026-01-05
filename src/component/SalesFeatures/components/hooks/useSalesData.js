import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SalesService from '../services/SalesService';
import salesDb from '../db/salesDb';

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
    setIsLoading(true);
    try {
      const { data, error } = await SalesService.fetchProducts(storeId);
      if (error) throw new Error(error);
      
      const processedProducts = (data || []).map(p => ({
        ...p,
        deviceIds: p.dynamic_product_imeis?.split(',').filter(Boolean) || [],
        deviceSizes: p.device_size?.split(',').filter(Boolean) || [],
      }));
      
      setProducts(processedProducts);
      
      // Cache products offline
      for (const product of processedProducts) {
        await salesDb.products.put({
          ...product,
          store_id: Number(storeId),
          cached_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      // Load from cache if offline
      const cached = await salesDb.products.where({ store_id: Number(storeId) }).toArray();
      setProducts(cached);
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  // Fetch Inventory
  const fetchInventory = useCallback(async () => {
    if (!storeId) return;
    try {
      const { data, error } = await SalesService.fetchAllInventory(storeId);
      if (error) throw new Error(error);
      setInventory(data || []);
      
      // Cache inventory
      for (const inv of data || []) {
        await salesDb.inventories.put({
          ...inv,
          store_id: Number(storeId),
          cached_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      // Load from cache
      const cached = await salesDb.inventories.where({ store_id: Number(storeId) }).toArray();
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
      // Check if user is store owner
      const identity = SalesService.getIdentity();
      const { data: storeOwner } = await SalesService.checkStoreOwner(storeId, userEmail);
      setIsOwner(!!storeOwner);

      const filters = storeOwner ? {} : { created_by_user_id: identity.currentUserId };
      const { data: salesData, error } = await SalesService.fetchSales(storeId, filters);

      if (error) throw new Error(error);

      const processedSales = (salesData || []).map(s => ({
        ...s,
        deviceIds: s.device_id?.split(',').filter(Boolean) || [],
        deviceSizes: s.device_size?.split(',').filter(Boolean) || [],
      }));

      setSales(processedSales);
      setFiltered(processedSales);
    } catch (err) {
      console.error('Failed to fetch sales:', err);
      toast.error('Failed to load sales');
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

  // Daily totals
  const dailyTotals = useMemo(() => {
    const groups = {};
    sales.forEach(s => {
      const date = new Date(s.sold_at).toISOString().split('T')[0];
      groups[date] = groups[date] || { period: date, total: 0, count: 0 };
      groups[date].total += Number(s.amount) || 0;
      groups[date].count += 1;
    });
    return Object.values(groups).sort((a, b) => b.period.localeCompare(a.period));
  }, [sales]);

  // Weekly totals
  const weeklyTotals = useMemo(() => {
    const groups = {};
    sales.forEach(s => {
      const date = new Date(s.sold_at);
      const start = new Date(date);
      start.setDate(date.getDate() - ((date.getDay() + 6) % 7));
      const key = start.toISOString().split('T')[0];
      groups[key] = groups[key] || { period: `Week of ${key}`, total: 0, count: 0 };
      groups[key].total += Number(s.amount) || 0;
      groups[key].count += 1;
    });
    return Object.values(groups).sort((a, b) => b.period.localeCompare(a.period));
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
    isOwner,
    fetchProducts,
    fetchInventory,
    fetchSales,
    setInventory,
    setSales,
  };
}