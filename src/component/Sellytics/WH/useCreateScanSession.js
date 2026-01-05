// hooks/useCreateScanSession.js
import { supabase } from '../../../supabaseClient';
import toast from "react-hot-toast";

export function useCreateScanSession() {
  const createSession = async (warehouseId, clientId, userId) => {
    const { data, error } = await supabase
      .from("warehouse_scan_sessions")
      .insert({
        warehouse_id: warehouseId,
        client_id: clientId,
        created_by: userId,
        status: "ACTIVE",
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to start scan session");
      console.error(error);
      return null;
    }

    toast.success("Scan session started!");
    return data.id;
  };

  return { createSession };
}