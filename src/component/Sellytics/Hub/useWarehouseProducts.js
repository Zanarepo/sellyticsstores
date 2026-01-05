// hooks/useWarehouseProducts.js - Warehouse Products Hook
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../supabaseClient";

export function useWarehouseProducts(warehouseId, clientId) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    if (!warehouseId || !clientId) {
      setProducts([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("warehouse_products")
        .select("id, product_name, sku, product_type, metadata")
        .eq("warehouse_id", warehouseId)
        .eq("warehouse_client_id", clientId)
        .order("product_name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [warehouseId, clientId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { 
    products, 
    loading, 
    refetch: fetchProducts 
  };
}