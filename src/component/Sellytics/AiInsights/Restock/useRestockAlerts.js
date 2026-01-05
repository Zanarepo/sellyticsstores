// useRestockAlerts.js
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../../supabaseClient'; // Adjust path as needed

export default function useRestockAlerts() {
  const [forecasts, setForecasts] = useState([]);
  const [storeName, setStoreName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storeId = localStorage.getItem('store_id');
        if (!storeId) throw new Error('No store ID found. Please log in.');

        // Fetch store name
        const { data: store, error: storeErr } = await supabase
          .from('stores')
          .select('shop_name')
          .eq('id', storeId)
          .single();
        if (storeErr) throw storeErr;
        setStoreName(store?.shop_name || 'Store');

        // Fetch forecasts
        const { data, error: fetchErr } = await supabase
          .from('forecasts')
          .select('*')
          .eq('store_id', storeId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (fetchErr) throw fetchErr;

        // Deduplicate
        const seen = new Set();
        const unique = data.filter(item => {
          const key = `${item.dynamic_product_id}-${item.store_id}-${item.forecast_period}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        setForecasts(unique);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Real-time subscription
    const storeId = localStorage.getItem('store_id');
    if (!storeId) return;

    const channel = supabase
      .channel(`forecasts:store=${storeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'forecasts',
          filter: `store_id=eq.${storeId}`,
        },
        (payload) => {
          const newForecast = payload.new;
          const key = `${newForecast.dynamic_product_id}-${newForecast.store_id}-${newForecast.forecast_period}`;

          setForecasts(prev => {
            if (prev.some(f => 
              `${f.dynamic_product_id}-${f.store_id}-${f.forecast_period}` === key
            )) return prev;

            return [newForecast, ...prev.slice(0, 49)];
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const stats = useMemo(() => {
    const needRestock = forecasts.filter(f => f.recommendation?.toLowerCase().includes('restock')).length;
    const wellStocked = forecasts.length - needRestock;
    return { total: forecasts.length, needRestock, wellStocked };
  }, [forecasts]);

  return { forecasts, storeName, loading, error, stats };
}