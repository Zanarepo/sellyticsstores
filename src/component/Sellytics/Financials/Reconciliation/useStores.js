// hooks/useStores.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import { toast } from 'react-toastify';

export default function useStores(ownerId, storeId, setStoreId) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStores = useCallback(async () => {
    if (!ownerId) {
      toast.error('No owner ID found. Please log in.');
      setStores([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('id, shop_name')
        .eq('owner_user_id', ownerId);
      if (error) throw error;
      setStores(data || []);
      if (data.length === 0) {
        toast.warn('No stores found for this owner.');
      } else if (!storeId && data.length > 0) {
        setStoreId(data[0].id);
        localStorage.setItem('store_id', data[0].id);
      }
    } catch (error) {
      toast.error('Error fetching stores: ' + error.message);
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, [ownerId, storeId, setStoreId]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return { stores, loading, fetchStores };
}