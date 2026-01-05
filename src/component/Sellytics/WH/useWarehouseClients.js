// hooks/useWarehouseClients.js
import { useState, useEffect } from "react";
import { supabase } from '../../../supabaseClient';
import toast from "react-hot-toast";

export function useWarehouseClients(warehouseId) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchClients = async () => {
    if (!warehouseId) {
      setClients([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("warehouse_clients")
      .select("id, client_type, sellytics_store_id, client_name, business_name, email, phone, is_active")
      .eq("warehouse_id", warehouseId)
      .eq("is_active", true)
      .order("client_name");

    if (error) {
      toast.error("Failed to load clients");
      console.error(error);
      setClients([]);
    } else {
      setClients(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, [warehouseId]);

  return { clients, loading, refetch: fetchClients };
}