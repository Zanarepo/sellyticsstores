import { useEffect, useState } from 'react';
import { supabase } from '../../../../../supabaseClient';

export function useStoreInfo() {
  const [store, setStore] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storeId = localStorage.getItem('store_id');
    if (!storeId) {
      setError('No store selected');
      return;
    }

    supabase
      .from('stores')
      .select('id, shop_name')
      .eq('id', storeId)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setStore(data);
      });
  }, []);

  return { store, error };
}
