// useAnomalyAlerts.js
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../../supabaseClient';

export default function useAnomalyAlerts() {
  const [anomalies, setAnomalies] = useState([]);
  const [storeName, setStoreName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storeId = localStorage.getItem("store_id");
        if (!storeId) throw new Error("No store ID found. Please log in.");

        // Fetch store name
        const { data: store, error: storeErr } = await supabase
          .from("stores")
          .select("shop_name")
          .eq("id", storeId)
          .single();

        if (storeErr) throw storeErr;
        setStoreName(store?.shop_name || "Store");

        // Fetch initial anomalies
        const { data, error: fetchErr } = await supabase
          .from("anomalies")
          .select("*, dynamic_product(name)")
          .eq("store_id", storeId)
          .order("created_at", { ascending: false })
          .limit(50);

        if (fetchErr) throw fetchErr;

        // Deduplicate
        const seen = new Set();
        const unique = data.filter(item => {
          const key = `${item.dynamic_product_id}-${item.quantity}-${item.sold_at}-${item.anomaly_type}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        setAnomalies(unique);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Real-time subscription
    const storeId = localStorage.getItem("store_id");
    if (!storeId) return;

    const channel = supabase
      .channel(`anomalies:store=${storeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "anomalies",
          filter: `store_id=eq.${storeId}`,
        },
        async (payload) => {
          const newAnomaly = payload.new;

          // Fetch product name if not already included
          let productName = "Unknown";
          if (!newAnomaly.dynamic_product) {
            const { data } = await supabase
              .from("dynamic_product")
              .select("name")
              .eq("id", newAnomaly.dynamic_product_id)
              .single();
            productName = data?.name || "Unknown";
          }

          setAnomalies(prev => {
            const key = `${newAnomaly.dynamic_product_id}-${newAnomaly.quantity}-${newAnomaly.sold_at}-${newAnomaly.anomaly_type}`;
            if (prev.some(a => 
              `${a.dynamic_product_id}-${a.quantity}-${a.sold_at}-${a.anomaly_type}` === key
            )) return prev;

            const enriched = { ...newAnomaly, dynamic_product: { name: productName } };
            return [enriched, ...prev.slice(0, 49)];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const stats = useMemo(() => {
    const high = anomalies.filter(a => a.anomaly_type === "High").length;
    const low = anomalies.filter(a => a.anomaly_type === "Low").length;
    return { total: anomalies.length, high, low };
  }, [anomalies]);

  return { anomalies, storeName, loading, error, stats };
}