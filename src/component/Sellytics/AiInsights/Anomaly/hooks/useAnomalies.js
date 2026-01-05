import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../../../../supabaseClient';
import { anomalyKey } from '../utils/anomalyKey';

export function useAnomalies(storeId, limit = 50) {
  const [anomalies, setAnomalies] = useState([]);
  const seen = useRef(new Set());

  useEffect(() => {
    if (!storeId) return;

    let channel;

    const load = async () => {
      const { data, error } = await supabase
        .from('anomalies')
        .select('*, dynamic_product(name)')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && data) {
        const unique = [];
        data.forEach(a => {
          const key = anomalyKey(a);
          if (!seen.current.has(key)) {
            seen.current.add(key);
            unique.push(a);
          }
        });
        setAnomalies(unique);
      }
    };

    load();

    channel = supabase
      .channel('anomaly-stream')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'anomalies',
          filter: `store_id=eq.${storeId}`,
        },
        async ({ new: a }) => {
          const key = anomalyKey(a);
          if (seen.current.has(key)) return;

          const { data: product } = await supabase
            .from('dynamic_product')
            .select('name')
            .eq('id', a.dynamic_product_id)
            .single();

          seen.current.add(key);
          setAnomalies(prev => [
            { ...a, dynamic_product: product },
            ...prev.slice(0, limit - 1),
          ]);
        }
      )
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [storeId, limit]);

  return anomalies;
}
