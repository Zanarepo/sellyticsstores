// hooks/useScanSession.js
import { useState } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { useSession } from "./useSession";

export function useScanSession() {
  const { userId } = useSession();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const createSession = async (warehouseId, clientId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("warehouse_scan_sessions")
        .insert([{ warehouse_id: warehouseId, client_id: clientId, created_by: userId }])
        .select()
        .single();
      if (error) throw error;
      setSessions([...sessions, data]);
      return data;
    } catch (e) {
      toast.error("Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  const closeSession = async (sessionId) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("warehouse_scan_sessions")
        .update({ status: "COMMITTED" })
        .eq("id", sessionId);
      if (error) throw error;
      setSessions(sessions.map((s) => (s.id === sessionId ? { ...s, status: "COMMITTED" } : s)));
    } catch (e) {
      toast.error("Failed to close session");
    } finally {
      setLoading(false);
    }
  };

  return { sessions, createSession, closeSession, loading };
}
