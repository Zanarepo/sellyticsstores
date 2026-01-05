import { useState, useEffect } from "react";
import { supabase } from '../../../../../supabaseClient';

export function useRestockRecommendations(storeId) {
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!storeId) return;

    const fetchRecommendations = async () => {
      try {
        const { data, error } = await supabase
          .from("restock_recommendations")
          .select("*")
          .eq("store_id", storeId)
          .order("created_at", { ascending: false })
          .limit(50);
        if (error) throw error;

        const seen = new Set();
        const unique = [];
        data.forEach((r) => {
          const key = `${r.dynamic_product_id}-${r.store_id}-${r.month}`;
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(r);
          }
        });
        setRecommendations(unique);

        const subscription = supabase
          .channel("restock_recommendations")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "restock_recommendations",
              filter: `store_id=eq.${storeId}`,
            },
            (payload) => {
              const newRec = payload.new;
              const key = `${newRec.dynamic_product_id}-${newRec.store_id}-${newRec.month}`;
              if (!seen.has(key)) {
                seen.add(key);
                setRecommendations(prev => [newRec, ...prev.slice(0, 49)]);
              }
            }
          )
          .subscribe();

        return () => supabase.removeChannel(subscription);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchRecommendations();
  }, [storeId]);

  const deleteRecommendation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this recommendation?")) return;

    try {
      const { error } = await supabase
        .from("restock_recommendations")
        .delete()
        .eq("id", id);
      if (error) throw error;

      setRecommendations(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return { recommendations, deleteRecommendation, error };
}
