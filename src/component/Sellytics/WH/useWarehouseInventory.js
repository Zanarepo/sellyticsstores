// hooks/useWarehouseInventory.js
import { useState, useEffect } from "react";
import { supabase } from '../../../supabaseClient';

export function useWarehouseInventory(warehouseId, clientId) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!warehouseId || !clientId) {
      setInventory([]);
      setLoading(false);
      return;
    }

    const calculateStock = async () => {
      setLoading(true);

      const { data: ledgerEntries, error } = await supabase
        .from("warehouse_ledger")
        .select(`
          warehouse_product_id,
          movement_type,
          quantity,
          warehouse_product_id!inner (
            id,
            product_name,
            sku,
            product_type
          )
        `)
        .eq("warehouse_id", warehouseId)
        .eq("client_id", clientId);

      if (error) {
        console.error("Error fetching ledger:", error);
        setInventory([]);
        setLoading(false);
        return;
      }

      // Calculate net stock per product
      const stockByProduct = {};

      ledgerEntries.forEach((entry) => {
        const productId = entry.warehouse_product_id.id;
        const product = entry.warehouse_product_id;

        if (!stockByProduct[productId]) {
          stockByProduct[productId] = {
            warehouse_product_id: {
              id: product.id,
              product_name: product.product_name,
              sku: product.sku,
              product_type: product.product_type,
            },
            available_qty: 0,
          };
        }

        if (entry.movement_type === "IN") {
          stockByProduct[productId].available_qty += entry.quantity;
        } else if (entry.movement_type === "OUT") {
          stockByProduct[productId].available_qty -= entry.quantity;
        }
      });

      // Convert to array and filter only products with stock
      const inStockItems = Object.values(stockByProduct)
        .filter((item) => item.available_qty > 0)
        .map((item) => ({
          warehouse_product_id: item.warehouse_product_id,
          available_qty: item.available_qty,
        }));

      setInventory(inStockItems);
      setLoading(false);
    };

    calculateStock();

    // Real-time: recalculate when ledger changes
    const subscription = supabase
      .channel("ledger-inventory-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "warehouse_ledger",
          filter: `client_id=eq.${clientId}`,
        },
        () => calculateStock()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [warehouseId, clientId]);

  return { inventory, loading };
}