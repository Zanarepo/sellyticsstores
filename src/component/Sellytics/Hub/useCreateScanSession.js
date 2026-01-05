// hooks/useCreateScanSession.js - Create Scan Session Hook
import { useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";

export function useCreateScanSession() {
  const [loading, setLoading] = useState(false);

  const createSession = useCallback(async (warehouseId, clientId, userId, options = {}) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("warehouse_scan_sessions")
        .insert({
          warehouse_id: warehouseId,
          client_id: clientId,
          created_by: userId,
          status: "ACTIVE",
          session_type: options.sessionType || "GENERAL",
          metadata: options.metadata || null,
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
    } catch (error) {
      console.error(error);
      toast.error("Failed to start scan session");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const closeSession = useCallback(async (sessionId, status = "COMMITTED") => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from("warehouse_scan_sessions")
        .update({ 
          status, 
          closed_at: new Date().toISOString() 
        })
        .eq("id", sessionId);

      if (error) {
        toast.error("Failed to close session");
        return false;
      }

      toast.success("Session closed");
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    createSession, 
    closeSession, 
    loading 
  };
}