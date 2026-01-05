import { useState, useEffect } from 'react';
import { supabase } from '../../../../supabaseClient';
import { toast } from 'react-toastify';

export default function useStores(ownerId) {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!ownerId) return;
    const fetchStores = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('stores')
        .select('id, shop_name')
        .eq('owner_user_id', ownerId);

      if (error) {
        toast.error('Error fetching stores: ' + error.message);
        setStores([]);
      } else {
        setStores(data || []);
      }
      setIsLoading(false);
    };
    fetchStores();
  }, [ownerId]);

  return { stores, isLoading };
}
