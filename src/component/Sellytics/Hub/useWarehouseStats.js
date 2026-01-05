// hooks/useWarehouseStats.js - Warehouse Statistics Hook
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../supabaseClient";

export function useWarehouseStats(warehouseId) {
  const [stats, setStats] = useState({
    totalInventory: 0,
    internalStores: 0,
    externalClients: 0,
    pendingReturns: 0,
    totalTransfers: 0,
    inventoryChange: null
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!warehouseId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch inventory totals
      const { data: inventory } = await supabase
        .from("warehouse_inventory")
        .select("quantity, available_qty")
        .eq("warehouse_id", warehouseId);

      const totalInventory = (inventory || []).reduce((sum, i) => sum + (i.quantity || 0), 0);

      // Fetch client counts
      const { data: clients } = await supabase
        .from("warehouse_clients")
        .select("id, client_type")
        .eq("warehouse_id", warehouseId)
        .eq("is_active", true);

      const internalStores = (clients || []).filter(c => c.client_type === "SELLYTICS_STORE").length;
      const externalClients = (clients || []).filter(c => c.client_type !== "SELLYTICS_STORE").length;

      // Fetch pending returns
      const { data: returns } = await supabase
        .from("warehouse_return_requests")
        .select("id")
        .eq("warehouse_id", warehouseId)
        .eq("status", "PENDING");

      const pendingReturns = (returns || []).length;

      // Fetch recent transfers
      const { data: transfers } = await supabase
        .from("warehouse_transfers")
        .select("id")
        .eq("warehouse_id", warehouseId);

      const totalTransfers = (transfers || []).length;

      setStats({
        totalInventory,
        internalStores,
        externalClients,
        pendingReturns,
        totalTransfers,
        inventoryChange: null
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }, [warehouseId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { 
    stats, 
    loading, 
    refetch: fetchStats 
  };
}