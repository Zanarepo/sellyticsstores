// hooks/useWarehouseInventory.js - Warehouse Inventory Hook
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../supabaseClient";

export function useWarehouseInventory(warehouseId, clientId) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchInventory = useCallback(async () => {
    if (!warehouseId) {
      setInventory([]);
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from("warehouse_inventory")
        .select(`
          id,
          warehouse_product_id,
          quantity,
          available_qty,
          total_cost,
          unit_cost,
         damaged_cost,
          damaged_qty,
          created_at,
          updated_at
        `)
        .eq("warehouse_id", warehouseId);

      // If clientId provided, filter products by client
      if (clientId) {
        // First get product IDs for this client
        const { data: products } = await supabase
          .from("warehouse_products")
          .select("id")
          .eq("warehouse_id", warehouseId)
          .eq("warehouse_client_id", clientId);

        const productIds = (products || []).map(p => p.id);
        
        if (productIds.length === 0) {
          setInventory([]);
          setLoading(false);
          return;
        }

        query = query.in("warehouse_product_id", productIds);
      }

      const { data, error } = await query;

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error("Failed to load inventory:", error);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }, [warehouseId, clientId]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return { 
    inventory, 
    loading, 
    refetch: fetchInventory 
  };
}