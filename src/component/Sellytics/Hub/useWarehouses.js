// hooks/useWarehouses.js - Warehouses Hook
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../supabaseClient";
import { useSession } from "./useSession";
import toast from "react-hot-toast";

export function useWarehouses() {
  const { storeId, ownerId } = useSession();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWarehouses = useCallback(async () => {
    if (!storeId && !ownerId) {
      setWarehouses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from("warehouses")
        .select("id, name, location, is_active")
        .eq("is_active", true)
        .order("name");

      // Filter by owner store
      if (storeId) {
        query = query.eq("owner_store_id", storeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setWarehouses(data || []);
    } catch (error) {
      console.error("Failed to load warehouses:", error);
      toast.error("Failed to load warehouses");
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  }, [storeId, ownerId]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  return { 
    warehouses, 
    loading, 
    refetch: fetchWarehouses 
  };
}