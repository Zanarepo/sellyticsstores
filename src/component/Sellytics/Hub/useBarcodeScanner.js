// hooks/useBarcodeScanner.js - Barcode Scanner Hook with Real-time Updates
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";

export function useBarcodeScanner({ sessionId, warehouseId, clientId, userId }) {
  const [scannedItems, setScannedItems] = useState([]);
  const [duplicateItems, setDuplicateItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setScannedItems([]);
      setDuplicateItems([]);
      return;
    }

    setLoading(true);

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
        setLoading(false);
      });

    // Realtime subscription
    const subscription = supabase
      .channel(`scan-events-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "warehouse_scan_events",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log("REALTIME NEW SCAN:", payload.new);
          setScannedItems((prev) => {
            const updated = [...prev, payload.new];
            calculateDuplicates(updated);
            return updated;
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "warehouse_scan_events",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setScannedItems((prev) => {
            const updated = prev.filter(item => item.id !== payload.old.id);
            calculateDuplicates(updated);
            return updated;
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "warehouse_scan_events",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setScannedItems((prev) => 
            prev.map(item => item.id === payload.new.id ? payload.new : item)
          );
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
      const value = item.scanned_value?.toLowerCase().trim();
      counts[value] = (counts[value] || 0) + 1;
    });
    const dups = Object.keys(counts).filter((k) => counts[k] > 1);
    setDuplicateItems(dups);
  };

  const scan = useCallback(async (value, options = {}) => {
    if (!value || !sessionId) return { success: false, error: "No value or session" };

    const trimmedValue = value.trim();
    
    // Check for duplicates if serialized
    if (options.preventDuplicates) {
      const isDuplicate = scannedItems.some(
        item => item.scanned_value?.toLowerCase() === trimmedValue.toLowerCase()
      );
      
      if (isDuplicate) {
        toast.error(`Duplicate: ${trimmedValue}`, { icon: "⚠️" });
        return { success: false, error: "Duplicate", isDuplicate: true };
      }
    }

    const { data, error } = await supabase
      .from("warehouse_scan_events")
      .insert({
        session_id: sessionId,
        scanned_value: trimmedValue,
        created_by: userId,
        is_duplicate: false,
        detected_product_id: options.productId || null,
        notes: options.notes || null,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to save scan");
      return { success: false, error: error.message };
    } else {
      toast.success("Scanned!", { duration: 1000 });
      return { success: true, data };
    }
  }, [sessionId, userId, scannedItems]);

  const deleteScan = useCallback(async (scanId) => {
    const { error } = await supabase
      .from("warehouse_scan_events")
      .delete()
      .eq("id", scanId);

    if (error) {
      toast.error("Failed to delete scan");
      return false;
    }
    
    toast.success("Scan removed");
    return true;
  }, []);

  const clearAll = useCallback(async () => {
    if (!sessionId) return false;

    const { error } = await supabase
      .from("warehouse_scan_events")
      .delete()
      .eq("session_id", sessionId);

    if (error) {
      toast.error("Failed to clear scans");
      return false;
    }

    setScannedItems([]);
    setDuplicateItems([]);
    toast.success("All scans cleared");
    return true;
  }, [sessionId]);

  const updateScanNotes = useCallback(async (scanId, notes) => {
    const { error } = await supabase
      .from("warehouse_scan_events")
      .update({ notes, updated_by: userId })
      .eq("id", scanId);

    if (error) {
      toast.error("Failed to update notes");
      return false;
    }

    toast.success("Notes saved");
    return true;
  }, [userId]);

  // Computed values
  const uniqueCount = new Set(scannedItems.map(i => i.scanned_value?.toLowerCase().trim())).size;
  const totalCount = scannedItems.length;
  const duplicateCount = totalCount - uniqueCount;

  return { 
    scannedItems, 
    duplicateItems, 
    scan, 
    deleteScan,
    clearAll,
    updateScanNotes,
    loading,
    stats: {
      total: totalCount,
      unique: uniqueCount,
      duplicates: duplicateCount
    }
  };
}