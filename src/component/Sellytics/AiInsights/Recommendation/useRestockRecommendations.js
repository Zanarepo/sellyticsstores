/**
 * Restock Recommendations Data Hook
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import toast from 'react-hot-toast';

export default function useRestockRecommendations() {
  const [storeId] = useState(localStorage.getItem('store_id') || null);
  const [storeName, setStoreName] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!storeId) {
      toast.error('No store ID found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      // Fetch store name
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('shop_name')
        .eq('id', storeId)
        .single();

      if (storeError) throw storeError;
      setStoreName(storeData.shop_name);

      // Fetch recommendations
      const { data, error } = await supabase
        .from('restock_recommendations')
        .select('id, dynamic_product_id, product_name, month, quantity_sold, recommendation, created_at')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Deduplicate by product_id, store_id, and month
      const uniqueRecommendations = [];
      const seen = new Set();
      for (const rec of data) {
        const key = `${rec.dynamic_product_id}-${storeId}-${rec.month}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueRecommendations.push(rec);
        }
      }

      setRecommendations(uniqueRecommendations);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchData();

    if (!storeId) return;

    // Real-time subscription
    const channel = supabase
      .channel('restock_recommendations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'restock_recommendations',
          filter: `store_id=eq.${storeId}`,
        },
        (payload) => {
          setRecommendations((prev) => {
            const newRec = payload.new;
            const key = `${newRec.dynamic_product_id}-${storeId}-${newRec.month}`;
            const exists = prev.some(
              (r) => `${r.dynamic_product_id}-${storeId}-${r.month}` === key
            );
            if (exists) return prev;
            toast.success('New recommendation added', { icon: '📊' });
            return [newRec, ...prev.slice(0, 49)];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData, storeId]);

  const deleteRecommendation = useCallback(async (id, productName) => {
    const toastId = toast.loading('Deleting...');

    try {
      const { error } = await supabase
        .from('restock_recommendations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRecommendations((prev) => prev.filter((rec) => rec.id !== id));
      toast.success(`Deleted ${productName}`, { id: toastId, icon: '🗑️' });
    } catch (err) {
      console.error('Failed to delete:', err);
      toast.error('Failed to delete recommendation', { id: toastId });
    }
  }, []);

  return {
    storeId,
    storeName,
    recommendations,
    loading,
    deleteRecommendation,
  };
}