// components/LedgerTable.js
import React, { useState, useEffect } from "react";
import { supabase } from '../../../supabaseClient';

export function LedgerTable({ warehouseId, clientId }) {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;

    supabase
      .from("warehouse_ledger")
      .select("*, warehouse_product_id(product_name, sku)")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (error) console.error(error);
        setLedger(data || []);
        setLoading(false);
      });
  }, [clientId]);

  if (loading) return <p>Loading ledger...</p>;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6">Transaction Ledger</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {ledger.map((entry) => (
              <tr key={entry.id}>
                <td className="px-4 py-3">{new Date(entry.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">{entry.warehouse_product_id.product_name}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    entry.movement_type === "IN" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {entry.movement_type}
                  </span>
                </td>
                <td className="px-4 py-3">{entry.quantity}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{entry.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}