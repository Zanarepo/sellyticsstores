// src/hooks/useSuppliersInventory.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../../supabaseClient';
import { toast } from 'react-toastify';

export function useSuppliersInventory(storeId) {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    supplier_name: '',
    device_name: '',
    qty_min: '',
    qty_max: '',
  });
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH INVENTORY ---------------- */
  const fetchInventory = useCallback(async () => {
    if (!storeId) return;

    setLoading(true);

    const { data, error } = await supabase
      .from('suppliers_inventory')
      .select(`
        id,
        supplier_name,
        supplier_phone,
        supplier_email,
        supplier_address,
        device_name,
        device_id,
        qty,
        created_at
      `)
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      toast.error('Failed to fetch inventory');
    } else {
      setInventory(data || []);
    }

    setLoading(false);
  }, [storeId]);

  /* ---------------- SUPPLIER DROPDOWN ---------------- */
  const suppliers = useMemo(() => {
    const unique = [
      ...new Set(
        inventory
          .map(i => i.supplier_name)
          .filter(Boolean)
      ),
    ];

    return [
      { value: '', label: 'All Suppliers' },
      ...unique.map(name => ({ value: name, label: name })),
    ];
  }, [inventory]);

  /* ---------------- FILTER + SEARCH ---------------- */
  const filtered = useMemo(() => {
    let result = [...inventory];

    /* Text Search */
    if (search.trim()) {
      const q = search.toLowerCase().trim();

      result = result.filter(item =>
        item.supplier_name?.toLowerCase().includes(q) ||
        item.device_name?.toLowerCase().includes(q) ||
        item.device_id?.toLowerCase().includes(q) ||
        item.supplier_phone?.toLowerCase().includes(q) ||
        item.supplier_email?.toLowerCase().includes(q)
      );
    }

    /* Supplier Filter */
    if (filters.supplier_name) {
      result = result.filter(
        item => item.supplier_name === filters.supplier_name
      );
    }

    /* Device Filter */
    if (filters.device_name.trim()) {
      const name = filters.device_name.toLowerCase().trim();
      result = result.filter(item =>
        item.device_name?.toLowerCase().includes(name)
      );
    }

    /* Quantity Filters */
    const min = parseInt(filters.qty_min);
    const max = parseInt(filters.qty_max);

    if (!isNaN(min)) result = result.filter(item => item.qty >= min);
    if (!isNaN(max)) result = result.filter(item => item.qty <= max);

    return result;
  }, [inventory, search, filters]);

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  /* ---------------- HELPERS ---------------- */
  const clearFilters = () => {
    setFilters({
      supplier_name: '',
      device_name: '',
      qty_min: '',
      qty_max: '',
    });
  };

  return {
    filtered,
    loading,
    search,
    setSearch,
    filters,
    setFilters: (field, value) =>
      setFilters(prev => ({ ...prev, [field]: value })),
    suppliers,
    clearFilters,
    refresh: fetchInventory,
  };
}
