// hooks/useWarehouseTransfer.js
import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

export function useWarehouseTransfer(fetchInventory) {
  const [loading, setLoading] = useState(false);
  const { scannedItems, addScannedItem, removeScannedItem, clearScans } = useBarcodeScanner();

  const transferItems = useCallback(
    async (warehouseId, clientId) => {
      const storeId = localStorage.getItem("store_id");
      if (!storeId) return toast.error("No store selected");

      setLoading(true);
      try {
        // Use RPC / API to perform transfer + ledger
        const { data, error } = await supabase.rpc("transfer_warehouse_to_store", {
          warehouse_id: warehouseId,
          client_id: clientId,
          store_id: Number(storeId),
          items: scannedItems
        });
        if (error) throw error;
        toast.success("Transfer successful");
        clearScans();
        await fetchInventory(storeId);
      } catch (e) {
        console.error(e);
        toast.error("Transfer failed");
      } finally {
        setLoading(false);
      }
    },
    [scannedItems, fetchInventory]
  );

  return { scannedItems, addScannedItem, removeScannedItem, transferItems, loading };
}
