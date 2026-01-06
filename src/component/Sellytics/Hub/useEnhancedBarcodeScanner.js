// useEnhancedBarcodeScanner.js - Delete & Clear All Fixed (Optimistic + Reliable)
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";

export function useEnhancedBarcodeScanner({
  sessionId,
  userId,
  productType = "SERIALIZED",
  onScanUpdate,
}) {
  const [scannedItems, setScannedItems] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isListening && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isListening, scannedItems]);

  const notifyUpdate = useCallback((items) => {
    const values = items.map((i) => i.scanned_value?.toLowerCase().trim()).filter(Boolean);
    const unique = new Set(values).size;
    onScanUpdate?.({
      total: items.length,
      unique,
      duplicates: items.length - unique,
    });
  }, [onScanUpdate]);

  // Load + real-time
  useEffect(() => {
    if (!sessionId) return;

    const loadScans = async () => {
      const { data } = await supabase
        .from("warehouse_scan_events")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (data) {
        setScannedItems(data);
        notifyUpdate(data);
      }
    };

    loadScans();

    const channel = supabase
      .channel(`scan-session-${sessionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "warehouse_scan_events", filter: `session_id=eq.${sessionId}` },
        (payload) => {
          setScannedItems((prev) => {
            const updated = [...prev, payload.new];
            notifyUpdate(updated);
            return updated;
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "warehouse_scan_events", filter: `session_id=eq.${sessionId}` },
        (payload) => {
          // payload.old may or may not have .id — safer to use payload.old?.id
          setScannedItems((prev) => {
            const updated = prev.filter((i) => i.id !== (payload.old?.id ?? payload.old));
            notifyUpdate(updated);
            return updated;
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [sessionId, notifyUpdate]);

  const playSound = (type = "success") => {
    if (!soundEnabled) return;
    try {
      const audio = new Audio(
        type === "success"
          ? "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2JlpuZmZmTiH1xY1tPR0M/Oz08PkFFSlBZYW10gIyXn6SnoZ+bl5GMh4J+e3h2dHRzdXd6fYGGi5CUl5mampqamJWRjIeBeXNsZmFdW1pcX2Nnb3Z+h5GaoKOko5+ak46Gg3x1bmlmZGRmaGtvc3h9g4mPlJeZmJeTjoiCfHZwamVhXlxcXV5hZWpwd36GjpWbo6impqSgnpqVj4mDfnh0cXBwcXJ0d3t+g4eLjpGUlZWUko+KhX94cm1oZWNiYmJjZmltc3l/ho2Tl5udnpyZlpKNiIN+enZ0c3N0dXd5fH+DhomMjpCRkI+NiYR/enVxbmtoZ2ZmZ2hqbXJ3fIOJj5SYmpuamJWRjYiDfnp3dHNycnR2eHt+gYWIioyOj4+Oi4iEf3p1cW5raWhoaWprbnJ3fIOJjpKVl5iXlZKPi4aDf3t4dnV1dnd5fH+Ch4qMjY+Pj42LiIR/e3ZybnBvb3BxdHZ6foKGioyOj4+Ojo2KhoJ+eXZzcnFxcnR2eXx/g4aJi42Oj42MioeCf3t4dXNycnN0dnh7foGEh4qLjY2NjIqIhYF+e3h2dXR0dXZ4ent+gYSHiouMjIyLioeEgX57eXd2dnZ3eHp8foGEhoiKioqKiYiGhIJ/fXt5eHd3eHl6fH6AgoSGiIiJiYiHhoSCgH57enl4eHh5ent9f4GDhYaHiIeHhoWEgn9+fHt6eXl5ent8fn+BgoSFhoeHhoaFhIKAf317enp5enp7fH1/gIKDhIWGhoaFhIOCgH9+fHt7e3t7fH1+f4CCg4SFhYWFhIOCgYB/fn18fHx8fX5/gIGCg4SEhYSEg4OCgYB/fn5+fn5+fn+AgIGCg4OEhIODg4KBgYB/f39/f39/gICAgYGCg4ODg4OCgoGBgICAf39/f4CAgICBgYKCgoKCgoKBgYGAgICAf4CAgICAgIGBgYGCgoKCgoGBgYGAgICAgICAgICAgICAgIGBgYGBgYGBgYGBgYCAgICAgICAgICAgICBgYGBgYGBgQ=="
          : "data:audio/wav;base64,UklGRl9vT19teleNBAAAAXQVZFZm10IBIAAAAAQBEAAAAbgAAAQEAAAW0AAAAAQE="
      );
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const handleScan = async (value) => {
    const trimmed = value.trim();
    if (!trimmed || !sessionId) return;

    const normalized = trimmed.toLowerCase();

    if (productType === "SERIALIZED" && scannedItems.some(i => i.scanned_value?.toLowerCase().trim() === normalized)) {
      playSound("error");
      toast.error(`Duplicate blocked: ${trimmed}`, { icon: "🔒" });
      setInputValue("");
      return;
    }

    const { error } = await supabase.from("warehouse_scan_events").insert({
      session_id: sessionId,
      scanned_value: trimmed,
      created_by: userId,
    });

    if (error) {
      playSound("error");
      toast.error("Failed to save scan");
    } else {
      playSound("success");
      toast.success(`Scanned: ${trimmed.slice(0, 30)}${trimmed.length > 30 ? "..." : ""}`);
    }

    setInputValue("");
  };

  // OPTIMISTIC DELETE - Instant UI + DB
  const handleDelete = async (scanId) => {
    // Optimistically remove from UI
    setScannedItems((prev) => prev.filter((i) => i.id !== scanId));

    const { error } = await supabase
      .from("warehouse_scan_events")
      .delete()
      .eq("id", scanId);

    if (error) {
      toast.error("Failed to delete scan");
      // Optionally refetch to restore consistency
    } else {
      toast.success("Scan removed");
    }
  };

  // OPTIMISTIC CLEAR ALL
  const handleClearAll = async () => {
    if (!window.confirm("Clear ALL scanned items? This cannot be undone.")) return;

    // Clear UI immediately
    setScannedItems([]);

    const { error } = await supabase
      .from("warehouse_scan_events")
      .delete()
      .eq("session_id", sessionId);

    if (error) {
      toast.error("Failed to clear all scans");
      // Optionally refetch
    } else {
      toast.success("All scans cleared");
    }
  };

  const uniqueCount = new Set(scannedItems.map((i) => i.scanned_value?.toLowerCase().trim())).size;
  const duplicateCount = scannedItems.length - uniqueCount;

  return {
    scannedItems,
    inputValue,
    setInputValue,
    inputRef,
    isListening,
    setIsListening,
    soundEnabled,
    setSoundEnabled,
    uniqueCount,
    totalCount: scannedItems.length,
    duplicateCount,
    handleScan,
    handleDelete,
    handleClearAll,
    playSound,
  };
}