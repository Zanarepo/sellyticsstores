// useStockIn.js - unit_cost now inserted into warehouse_inventory
import { useState, useCallback } from "react";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";

export function useStockIn({ warehouseId, clientId, products, onSuccess }) {
  const userEmail = localStorage.getItem("user_email");

  if (!userEmail) {
    console.error("user_email missing from localStorage");
  }

  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState(""); // ← Unit cost state
  const [notes, setNotes] = useState("");
  const [condition, setCondition] = useState("GOOD");
  const [scannerActive, setScannerActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [scanStats, setScanStats] = useState({ total: 0, unique: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProduct = products.find(
    (p) => p.id === Number(selectedProductId)
  );

  const startScanSession = async () => {
    if (!userEmail) {
      toast.error("User email not found. Cannot start scan session.");
      return;
    }

    const { data, error } = await supabase
      .from("warehouse_scan_sessions")
      .insert({
        warehouse_id: warehouseId,
        client_id: clientId,
        created_by: userEmail,
        status: "ACTIVE",
        session_type: "STOCK_IN",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Scan session error:", error);
      toast.error("Failed to start scan session");
      return;
    }

    setSessionId(data.id);
    setScannerActive(true);
    toast.success("Scanner activated");
  };

  const handleScanUpdate = useCallback(
    (stats) => {
      setScanStats(stats);

      if (selectedProduct?.product_type === "SERIALIZED") {
        setQuantity(stats.unique);
      } else if (selectedProduct?.product_type === "BATCH") {
        setQuantity(stats.total);
      }
    },
    [selectedProduct?.product_type]
  );

  const handleSubmit = async () => {
    if (!selectedProductId) {
      toast.error("Please select a product");
      return;
    }

    if (quantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    if (!userEmail) {
      toast.error("User email missing. Cannot complete stock-in.");
      return;
    }

    setIsSubmitting(true);

    try {
      let uniqueIdentifiers = null;

      if (scannerActive && sessionId) {
        const { data: scans, error } = await supabase
          .from("warehouse_scan_events")
          .select("scanned_value")
          .eq("session_id", sessionId);

        if (!error && scans?.length) {
          uniqueIdentifiers =
            selectedProduct?.product_type === "SERIALIZED"
              ? [...new Set(scans.map((s) => s.scanned_value))]
              : scans.map((s) => s.scanned_value);
        }
      }

      // Ledger insert (unchanged)
      const { error: ledgerError } = await supabase
        .from("warehouse_ledger")
        .insert({
          warehouse_id: warehouseId,
          warehouse_product_id: Number(selectedProductId),
          client_id: clientId,
          movement_type: "IN",
          movement_subtype: "STOCK_IN",
          quantity,
          unique_identifiers: uniqueIdentifiers,
          notes: notes || "Stock received",
          item_condition: condition,
          created_by: userEmail,
        });

      if (ledgerError) throw ledgerError;

      // Inventory check — now includes unit_cost in select
      const { data: existingInv, error: fetchError } = await supabase
        .from("warehouse_inventory")
        .select("id, quantity, available_qty, damaged_qty, unit_cost")
        .eq("warehouse_id", warehouseId)
        .eq("warehouse_product_id", Number(selectedProductId))
        .eq("client_id", clientId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      // Parse unit cost (allow empty = null)
      const parsedUnitCost = unitCost === "" ? null : parseFloat(unitCost);

      if (existingInv) {
        const updates = {
          quantity: existingInv.quantity + quantity,
        };

        if (condition === "GOOD") {
          updates.available_qty = existingInv.available_qty + quantity;
        }

        if (condition === "DAMAGED") {
          updates.damaged_qty =
            (existingInv.damaged_qty || 0) + quantity;
        }

        // Only update unit_cost if a new value was provided
        if (parsedUnitCost !== null) {
          updates.unit_cost = parsedUnitCost;
        }

        const { error } = await supabase
          .from("warehouse_inventory")
          .update(updates)
          .eq("id", existingInv.id);

        if (error) throw error;
      } else {
        // New inventory entry — now includes unit_cost
        const { error } = await supabase
          .from("warehouse_inventory")
          .insert({
            warehouse_id: warehouseId,
            warehouse_product_id: Number(selectedProductId),
            client_id: clientId,
            quantity,
            available_qty: condition === "GOOD" ? quantity : 0,
            damaged_qty: condition === "DAMAGED" ? quantity : 0,
            unit_cost: parsedUnitCost, // ← INSERTED HERE
          });

        if (error) throw error;
      }

      // Close scan session
      if (sessionId) {
        await supabase
          .from("warehouse_scan_sessions")
          .update({ status: "COMMITTED" })
          .eq("id", sessionId);
      }

      toast.success(
        `Successfully stocked in ${quantity} unit${quantity > 1 ? "s" : ""}`
      );

      // Reset
      setSelectedProductId("");
      setQuantity(1);
      setUnitCost(""); // Reset unit cost
      setNotes("");
      setCondition("GOOD");
      setScannerActive(false);
      setSessionId(null);
      setScanStats({ total: 0, unique: 0 });

      onSuccess?.();
    } catch (error) {
      console.error("Stock-in error:", error);
      toast.error("Failed to stock in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    selectedProductId,
    setSelectedProductId,
    quantity,
    setQuantity,
    unitCost,
    setUnitCost,
    notes,
    setNotes,
    condition,
    setCondition,
    scannerActive,
    setScannerActive,
    sessionId,
    scanStats,
    isSubmitting,
    selectedProduct,
    startScanSession,
    handleScanUpdate,
    handleSubmit,
  };
}