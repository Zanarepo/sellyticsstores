// hooks/usePayableEntries.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import { toast } from 'react-hot-toast';

export default function usePayableEntries(storeId) {
  const [apEntries, setApEntries] = useState([]);
  const [filteredAp, setFilteredAp] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchApEntries = useCallback(async () => {
    if (!storeId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('accounts_payable')
        .select(`
          id,
          supplier_name,
          amount,
          status,
          transaction_date,
          dynamic_product_id,
          dynamic_product (name, device_id, dynamic_product_imeis, purchase_qty, device_size)
        `)
        .eq('store_id', storeId)
        .order('transaction_date', { ascending: false });

      if (error) throw error;

      setApEntries(data || []);
      setFilteredAp(data || []);
    } catch (error) {
      toast.error('Can’t load bills: ' + error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchApEntries();
  }, [fetchApEntries]);

  useEffect(() => {
    const filtered = apEntries.filter(entry => {
      const matchesSearch = searchTerm
        ? entry.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      const matchesStatus = statusFilter
        ? entry.status === (statusFilter === 'Unpaid' ? 'Pending' : statusFilter === 'Part Paid' ? 'Partial' : statusFilter)
        : true;
      return matchesSearch && matchesStatus;
    });
    setFilteredAp(filtered);
  }, [searchTerm, statusFilter, apEntries]);

  const updatePaymentStatus = async (id, status) => {
    const newStatus = status === 'Unpaid' ? 'Pending' : status === 'Part Paid' ? 'Partial' : status;
    try {
      const { error } = await supabase
        .from('accounts_payable')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast.success('Payment status updated.');
      fetchApEntries();
    } catch (error) {
      toast.error('Can’t update payment status: ' + error.message);
    }
  };

  return {
    apEntries,
    filteredAp,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    updatePaymentStatus,
    fetchApEntries,
  };
}