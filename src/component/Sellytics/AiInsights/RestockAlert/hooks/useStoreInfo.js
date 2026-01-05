import { useState, useEffect } from "react";
import { supabase } from "../../../../../supabaseClient";

export function useStoreInfo() {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStore = async () => {
      const storeId = localStorage.getItem("store_id");
      if (!storeId) {
        setError("No store ID found in local storage.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", storeId)
        .single();

      if (error) setError(error.message);
      else setStore(data);
      setLoading(false);
    };

    fetchStore();
  }, []);

  return { store, loading, error };
}
