// hooks/useWarehouseProducts.js
import { useState, useEffect } from "react";
import { supabase } from '../../../supabaseClient';

export function useWarehouseProducts(warehouseId, clientId) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!warehouseId || !clientId) {
      setProducts([]);
      return;
    }

    setLoading(true);
    supabase
      .from("warehouse_products")
      .select("id, product_name, sku, product_type, metadata")
      .eq("warehouse_id", warehouseId)
      .eq("warehouse_client_id", clientId)
      .order("product_name")
      .then(({ data, error }) => {
        if (error) console.error(error);
        setProducts(data || []);
      })
      .finally(() => setLoading(false));
  }, [warehouseId, clientId]);

  return { products, loading };
}