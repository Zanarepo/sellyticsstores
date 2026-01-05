// hooks/useBarcodeScanner.js
import { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";

export function useBarcodeScanner({ sessionId, warehouseId, clientId, userId }) {
  const [scannedItems, setScannedItems] = useState([]);
  const [duplicateItems, setDuplicateItems] = useState([]);

  useEffect(() => {
    if (!sessionId) {
      setScannedItems([]);
      setDuplicateItems([]);
      return;
    }

    // Load initial data
    supabase
      .from("warehouse_scan_events")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("Load error:", error);
        } else {
          setScannedItems(data || []);
          calculateDuplicates(data || []);
        }
      });

    // Realtime subscription
    const subscription = supabase
      .channel("scan-events")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "warehouse_scan_events",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log("REALTIME NEW SCAN:", payload.new); // ← This must appear!
          setScannedItems((prev) => {
            const updated = [...prev, payload.new];
            calculateDuplicates(updated);
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [sessionId]);

  const calculateDuplicates = (items) => {
    const counts = {};
    items.forEach((item) => {
      counts[item.scanned_value] = (counts[item.scanned_value] || 0) + 1;
    });
    const dups = Object.keys(counts).filter((k) => counts[k] > 1);
    setDuplicateItems(dups);
  };

  const scan = async (value) => {
    if (!value || !sessionId) return;

    const { error } = await supabase
      .from("warehouse_scan_events")
      .insert({
        session_id: sessionId,
        scanned_value: value,
        created_by: userId,
      });

    if (error) {
      toast.error("Failed to save scan");
    } else {
      toast.success("Scanned!");
    }
  };

  return { scannedItems, duplicateItems, scan };
}