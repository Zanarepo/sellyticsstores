// hooks/useReturnsData.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { ReturnsService } from './services/returnsService';
import { PAGINATION, REALTIME_CHANNEL } from './returnsConstants';
import { toast } from 'react-hot-toast';

export function useReturnsData({ supabase, warehouseId, userId, initialFilters = {} }) {
  const [returns, setReturns] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, processed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION.DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState(initialFilters);

  // Create service only once (or when warehouseId/userId changes)
  const serviceRef = useRef();
  if (!serviceRef.current || 
      serviceRef.current.warehouseId !== warehouseId || 
      serviceRef.current.userId !== userId) {
    serviceRef.current = new ReturnsService(supabase, warehouseId, userId);
  }
  const service = serviceRef.current;

  const isReady = !!warehouseId && !!service;

  // Stable fetch functions
  const fetchReturns = useCallback(async () => {
    if (!isReady) {
      setReturns([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, count } = await service.fetchReturns({
        page,
        pageSize,
        ...filters
      });
      setReturns(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching returns:', error);
      toast.error('Failed to load returns');
      setReturns([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [isReady, service, page, pageSize, filters]);

  const fetchCounts = useCallback(async () => {
    if (!isReady) {
      setCounts({ pending: 0, processed: 0, total: 0 });
      return;
    }

    try {
      const countsData = await service.getCounts();
      setCounts(countsData || { pending: 0, processed: 0, total: 0 });
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  }, [isReady, service]);

  // Trigger fetch when page, filters, or readiness changes
  useEffect(() => {
    if (!isReady) {
      setLoading(false);
      return;
    }
    fetchReturns();
    fetchCounts();
  }, [isReady, page, pageSize, filters.status, filters.searchQuery, filters.warehouseFilter, fetchReturns, fetchCounts]);
  // Only re-run when actual inputs change — not the functions themselves

  // Realtime subscription
  useEffect(() => {
    if (!isReady || !supabase) return;

    const channel = supabase
      .channel(`${REALTIME_CHANNEL}_${warehouseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'warehouse_return_requests',
          filter: `warehouse_id=eq.${warehouseId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newReturn = payload.new;
            setReturns(prev => [newReturn, ...prev]);
            setTotalCount(prev => prev + 1);
            setCounts(prev => ({
              ...prev,
              total: prev.total + 1,
              pending: newReturn.status === 'REQUESTED' ? prev.pending + 1 : prev.pending
            }));
            toast.success('New return request received');
          } else if (payload.eventType === 'UPDATE') {
            setReturns(prev =>
              prev.map(item => item.id === payload.new.id ? { ...payload.new, ...item } : item)
            );
            fetchCounts(); // Status may have changed
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            setReturns(prev => prev.filter(item => item.id !== deletedId));
            setTotalCount(prev => Math.max(0, prev - 1));
            setCounts(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isReady, supabase, warehouseId, fetchCounts]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  }, []);

  const refetch = useCallback(() => {
    fetchReturns();
    fetchCounts();
  }, [fetchReturns, fetchCounts]);

  return {
    returns,
    counts,
    loading,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount,
    updateFilters,
    refetch,
    refetchCounts: fetchCounts
  };
}