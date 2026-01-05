// hooks/useStores.js
import { useState, useCallback, useEffect } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

export function useStores(fetchInventory) {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStores = useCallback(async () => {
    const ownerId = localStorage.getItem("owner_id");
    const singleStoreId = localStorage.getItem("store_id");

    setLoading(true);
    try {
      if (!ownerId) {
        // Single-store user
        setStores([]);
        setSelectedStore(singleStoreId);
        if (singleStoreId) await fetchInventory(singleStoreId);
      } else {
        // Multi-store user
        const { data, error } = await supabase
          .from("stores")
          .select("id, shop_name")
          .eq("owner_user_id", Number(ownerId))
          .order("shop_name");
        if (error) throw error;

        setStores(data || []);

        if (!selectedStore && data?.length) {
          const id = String(data[0].id);
          setSelectedStore(id);
          localStorage.setItem("store_id", id);
          await fetchInventory(id);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load stores");
    } finally {
      setLoading(false);
    }
  }, [selectedStore, fetchInventory]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const selectStore = async (storeId) => {
    setSelectedStore(storeId);
    localStorage.setItem("store_id", storeId);
    await fetchInventory(storeId);
  };

  return { stores, selectedStore, selectStore, loading };
}
