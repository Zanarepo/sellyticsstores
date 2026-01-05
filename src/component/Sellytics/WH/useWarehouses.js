// hooks/useWarehouses.js
import { useState, useEffect } from "react";
import { supabase } from '../../../supabaseClient';
import toast from "react-hot-toast";
import { useSession } from "./useSession";

export function useWarehouses() {
  const { storeId } = useSession();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId) {
      setWarehouses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from("warehouses")
      .select("id, name, location")
      .eq("owner_store_id", storeId) // assuming column name
      .order("name")
      .then(({ data, error }) => {
        if (error) {
          toast.error("Failed to load warehouses");
          console.error(error);
          setWarehouses([]);
        } else {
          setWarehouses(data || []);
        }
      })
      .finally(() => setLoading(false));
  }, [storeId]);

  return { warehouses, loading };
}