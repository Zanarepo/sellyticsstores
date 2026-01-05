// hooks/useLedger.js
import { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";

export const useLedger = (clientId) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;

    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("warehouse_ledger")
        .select("*, warehouse_product_id (product_name, sku)")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (!error) setEntries(data || []);
      setLoading(false);
    };

    fetch();
  }, [clientId]);

  return { entries, loading };
};