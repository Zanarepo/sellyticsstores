import { useState, useEffect } from "react";
import { supabase } from "../../../../../supabaseClient";

export function useStoreInfo() {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const storeId = localStorage.getItem("store_id");
        if (!storeId) throw new Error("No store ID found");

        const { data, error } = await supabase
          .from("stores")
          .select("*")
          .eq("id", storeId)
          .single();
        if (error) throw error;
        setStore(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, []);

  return { store, loading, error };
}
