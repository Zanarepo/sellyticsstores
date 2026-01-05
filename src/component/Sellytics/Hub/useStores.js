// hooks/useStores.js - Stores Management Hook
import { useState, useCallback, useEffect } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";

export function useStores(fetchInventoryCallback) {
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
        if (singleStoreId) {
          // Fetch single store details
          const { data: store, error } = await supabase
            .from("stores")
            .select("id, shop_name, physical_address, state, business_address")
            .eq("id", Number(singleStoreId))
            .single();

          if (!error && store) {
            setStores([store]);
            setSelectedStore(singleStoreId);
            if (fetchInventoryCallback) {
              await fetchInventoryCallback(singleStoreId);
            }
          } else {
            setStores([]);
          }
        } else {
          setStores([]);
        }
      } else {
        // Multi-store user (owner)
        const { data, error } = await supabase
          .from("stores")
          .select("id, shop_name, physical_address, state, business_address, is_active")
          .eq("owner_user_id", Number(ownerId))
          .eq("is_active", true)
          .order("shop_name");

        if (error) throw error;

        setStores(data || []);

        // Auto-select first store if none selected
        if (!selectedStore && data?.length) {
          const id = String(data[0].id);
          setSelectedStore(id);
          localStorage.setItem("store_id", id);
          if (fetchInventoryCallback) {
            await fetchInventoryCallback(id);
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load stores");
    } finally {
      setLoading(false);
    }
  }, [selectedStore, fetchInventoryCallback]);

  useEffect(() => {
    fetchStores();
  }, []);

  const selectStore = useCallback(async (storeId) => {
    setSelectedStore(storeId);
    localStorage.setItem("store_id", storeId);
    if (fetchInventoryCallback) {
      await fetchInventoryCallback(storeId);
    }
  }, [fetchInventoryCallback]);

  const getStoreById = useCallback((storeId) => {
    return stores.find(s => s.id.toString() === storeId?.toString());
  }, [stores]);

  return { 
    stores, 
    selectedStore, 
    selectStore, 
    loading,
    refetch: fetchStores,
    getStoreById
  };
}