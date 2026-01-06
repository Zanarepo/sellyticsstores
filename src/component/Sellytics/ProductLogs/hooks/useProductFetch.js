// useProductFetch.js
import { useState, useEffect, useCallback } from 'react';
import offlineDB from '../db/offlineDB';

export function useProductFetch(storeId, isOnline, supabaseRef) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    setError(null);

    try {
      const cached = await offlineDB.getProducts(storeId);
      if (cached && cached.length > 0) setProducts(cached);

      if (isOnline && supabaseRef.current) {
        const { data, error: fetchError } = await supabaseRef.current
          .from('dynamic_product')
          .select('*')
          .eq('store_id', storeId)
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('Supabase fetch error:', fetchError);
        } else if (data) {
          setProducts(data);
          await offlineDB.cacheProducts(data, storeId);
        }
      }
    } catch (err) {
      console.error('Fetch products error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [storeId, isOnline, supabaseRef]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, setProducts, loading, error, fetchProducts };
}
