// hooks/useReceivableEntries.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import { toast } from 'react-hot-toast';

export default function useReceivableEntries() {
  const [arEntries, setArEntries] = useState([]);
  const [filteredAr, setFilteredAr] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [agingFilter, setAgingFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchArEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const storeId = localStorage.getItem('store_id');
      if (!storeId) return;

      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('store_id', storeId)
        .gt('remaining_balance', 0)
        .order('date', { ascending: false });

      if (error) throw error;

      setArEntries(data || []);
      setFilteredAr(data || []);
    } catch (error) {
      toast.error('Can’t load receivables: ' + error.message);
      setArEntries([]);
      setFilteredAr([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArEntries();
  }, [fetchArEntries]);

  useEffect(() => {
    const filtered = arEntries.filter(entry => {
      const matchesSearch = searchTerm
        ? entry.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const daysOverdue = Math.floor((new Date() - new Date(entry.date)) / (1000 * 60 * 60 * 24));
      const matchesAging = agingFilter
        ? (agingFilter === '0-30' && daysOverdue <= 30) ||
          (agingFilter === '31-60' && daysOverdue > 30 && daysOverdue <= 60) ||
          (agingFilter === '61-90' && daysOverdue > 60 && daysOverdue <= 90) ||
          (agingFilter === '90+' && daysOverdue > 90)
        : true;

      return matchesSearch && matchesAging;
    });

    setFilteredAr(filtered);
  }, [searchTerm, agingFilter, arEntries]);

  return {
    arEntries,
    filteredAr,
    isLoading,
    searchTerm,
    setSearchTerm,
    agingFilter,
    setAgingFilter,
    fetchArEntries,
  };
}