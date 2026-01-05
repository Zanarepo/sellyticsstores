// hooks/useWarehouseStock.js
import { useState } from "react";
import { supabase } from '../../../supabaseClient';
import toast from "react-hot-toast";
import { useSession } from "./useSession";

export function useWarehouseStock() {
  const { userId } = useSession();
  const [loading, setLoading] = useState(false);

  const stockIn = async ({ warehouseId, clientId, productId, quantity, serials }) => {
    setLoading(true);
    try {
      // RPC call or insert to warehouse_ledger
      const { data, error } = await supabase.rpc("stock_in_warehouse", {
        warehouse_id: warehouseId,
        client_id: clientId,
        product_id: productId,
        quantity,
        serials,
        created_by: userId,
      });
      if (error) throw error;
      toast.success("Stock In successful");
      return data;
    } catch (e) {
      console.error(e);
      toast.error("Stock In failed");
    } finally {
      setLoading(false);
    }
  };

  const stockOut = async ({ warehouseId, clientId, productId, quantity, serials }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("stock_out_warehouse", {
        warehouse_id: warehouseId,
        client_id: clientId,
        product_id: productId,
        quantity,
        serials,
        created_by: userId,
      });
      if (error) throw error;
      toast.success("Stock Out successful");
      return data;
    } catch (e) {
      console.error(e);
      toast.error("Stock Out failed");
    } finally {
      setLoading(false);
    }
  };

  const processReturn = async ({ warehouseId, clientId, productId, quantity, reason }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("warehouse_return_requests")
        .insert([{ warehouse_id: warehouseId, client_id: clientId, warehouse_product_id: productId, quantity, reason }])
        .select();
      if (error) throw error;
      toast.success("Return request created");
      return data;
    } catch (e) {
      console.error(e);
      toast.error("Return failed");
    } finally {
      setLoading(false);
    }
  };

  return { loading, stockIn, stockOut, processReturn };
}
