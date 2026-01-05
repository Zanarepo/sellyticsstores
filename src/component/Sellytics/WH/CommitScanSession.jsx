// components/CommitScanSession.js
import React, { useState } from "react";
import { supabase } from '../../../supabaseClient';

export function CommitScanSession({ sessionId, warehouseId, clientId, userId }) {
  const [loading, setLoading] = useState(false);

  const commitSession = async () => {
    setLoading(true);
    try {
      // 1️⃣ Get all scanned items
      const { data: scans, error } = await supabase
        .from("warehouse_scan_events")
        .select("*")
        .eq("session_id", sessionId);

      if (error) throw error;

      // 2️⃣ Insert each into warehouse_ledger
      for (const scan of scans) {
        const quantity = scan.detected_product_id ? 1 : scan.quantity || 1;

        await supabase.from("warehouse_ledger").insert([
          {
            warehouse_id: warehouseId,
            warehouse_product_id: scan.detected_product_id,
            client_id: clientId,
            movement_type: "IN",
            direction: "IN",
            quantity,
            unique_identifiers: scan.detected_product_id ? [scan.scanned_value] : null,
            created_by: userId,
            notes: scan.notes,
          },
        ]);
      }

      // 3️⃣ Update warehouse_inventory quantities
      const productGroups = scans.reduce((acc, scan) => {
        const key = scan.detected_product_id || "bulk";
        if (!acc[key]) acc[key] = [];
        acc[key].push(scan);
        return acc;
      }, {});

      for (const key in productGroups) {
        const group = productGroups[key];
        const productId = key === "bulk" ? null : Number(key);
        const totalQty = group.length;

        if (!productId) continue;

        const { data: inv } = await supabase
          .from("warehouse_inventory")
          .select("*")
          .eq("warehouse_product_id", productId)
          .single();

        if (inv) {
          await supabase
            .from("warehouse_inventory")
            .update({ quantity: inv.quantity + totalQty, available_qty: inv.available_qty + totalQty })
            .eq("warehouse_product_id", productId);
        } else {
          await supabase.from("warehouse_inventory").insert({
            warehouse_product_id: productId,
            quantity: totalQty,
            available_qty: totalQty,
          });
        }
      }

      // 4️⃣ Close session
      await supabase.from("warehouse_scan_sessions").update({ status: "COMMITTED", closed_at: new Date() }).eq("id", sessionId);

      alert("Session committed successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to commit session: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={commitSession} disabled={loading}>
      {loading ? "Committing..." : "Commit Scan Session"}
    </button>
  );
}
