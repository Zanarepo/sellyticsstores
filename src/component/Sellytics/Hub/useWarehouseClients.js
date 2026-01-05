// hooks/useWarehouseClients.js - Warehouse Clients Hook
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";

export function useWarehouseClients(warehouseId) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchClients = useCallback(async () => {
    if (!warehouseId) {
      setClients([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("warehouse_clients")
        .select(`
          id, 
          client_type, 
          sellytics_store_id, 
          client_name, 
          business_name, 
          email, 
          phone, 
          is_active,
          created_at
        `)
        .eq("warehouse_id", warehouseId)
        .eq("is_active", true)
        .order("client_name");

      if (error) throw error;

      // Get product counts for each client
      const clientIds = (data || []).map(c => c.id);
      
      if (clientIds.length > 0) {
        const { data: productCounts } = await supabase
          .from("warehouse_products")
          .select("warehouse_client_id")
          .eq("warehouse_id", warehouseId)
          .in("warehouse_client_id", clientIds);

        const counts = {};
        (productCounts || []).forEach(p => {
          counts[p.warehouse_client_id] = (counts[p.warehouse_client_id] || 0) + 1;
        });

        const enrichedClients = (data || []).map(client => ({
          ...client,
          product_count: counts[client.id] || 0
        }));

        setClients(enrichedClients);
      } else {
        setClients(data || []);
      }
    } catch (error) {
      console.error("Failed to load clients:", error);
      toast.error("Failed to load clients");
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [warehouseId]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return { 
    clients, 
    loading, 
    refetch: fetchClients 
  };
}