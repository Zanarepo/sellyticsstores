// src/hooks/useStores.js
import { useState, useEffect } from 'react';
import { supabase } from '../../../../supabaseClient';
import toast from 'react-hot-toast';

export default function useStores(ownerId) {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!ownerId) {
      setStores([]);
      setIsLoading(false);
      return;
    }

    async function fetchStores() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('stores')
        .select('id, shop_name')
        .eq('owner_user_id', ownerId)
        .order('shop_name');

      if (error) {
        toast.error('Failed to load stores');
        setStores([]);
      } else {
        setStores(data || []);
      }
      setIsLoading(false);
    }

    fetchStores();
  }, [ownerId]);

  return { stores, isLoading };
}