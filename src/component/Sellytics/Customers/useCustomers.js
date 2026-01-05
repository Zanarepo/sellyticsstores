// src/hooks/useCustomers.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';

export function useCustomers(storeId) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const fetchCustomers = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);

    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('customer')
      .select('*', { count: 'exact' })
      .eq('store_id', storeId)
      .order('fullname', { ascending: true })
      .range(from, to);

    if (searchTerm.trim()) {
      query = query.ilike('fullname', `%${searchTerm.trim()}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching customers:', error);
    } else {
      setCustomers(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }, [storeId, searchTerm, page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const refresh = () => fetchCustomers();

  const resetPage = () => setPage(0);

  return {
    customers,
    loading,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    totalCount,
    pageSize,
    refresh,
    resetPage,
  };
}