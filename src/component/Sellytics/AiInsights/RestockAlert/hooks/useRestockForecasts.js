import { useState, useEffect } from "react";
import { supabase } from "../../../../../supabaseClient";

export function useRestockForecasts(storeId) {
  const [forecasts, setForecasts] = useState([]);

  useEffect(() => {
    if (!storeId) return;

    const fetchForecasts = async () => {
      const { data, error } = await supabase
        .from("forecasts")
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) return console.error("Error fetching forecasts:", error.message);

      // Deduplicate by product + store + period
      const unique = [];
      const seen = new Set();
      data.forEach(f => {
        const key = `${f.dynamic_product_id}-${f.store_id}-${f.forecast_period}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(f);
        }
      });

      setForecasts(unique);
    };

    fetchForecasts();

    // Real-time subscription
    const subscription = supabase
      .channel("forecasts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "forecasts", filter: `store_id=eq.${storeId}` },
        payload => {
          setForecasts(prev => {
            const newF = payload.new;
            const key = `${newF.dynamic_product_id}-${newF.store_id}-${newF.forecast_period}`;
            if (prev.some(f => `${f.dynamic_product_id}-${f.store_id}-${f.forecast_period}` === key)) return prev;
            return [newF, ...prev.slice(0, 49)];
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [storeId]);

  return [forecasts, setForecasts];
}
