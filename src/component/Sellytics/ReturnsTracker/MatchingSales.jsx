// src/components/returns-management/MatchingSales.jsx
import React from 'react';
import { useCurrency } from '../../context/currencyContext';

export default function MatchingSales({ queriedReceipts }) {
  const { formatPrice } = useCurrency();

  if (queriedReceipts.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Matching Sales ({queriedReceipts.length})</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-slate-800">
            <tr>
              <th className="text-left px-4 py-3">Receipt</th>
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-left px-4 py-3">Product</th>
              <th className="text-left px-4 py-3">Device ID</th>
              <th className="text-left px-4 py-3">Qty</th>
              <th className="text-left px-4 py-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {queriedReceipts.map(r => (
              <tr key={r.id} className="border-t hover:bg-gray-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3">{r.receipt_code}</td>
                <td className="px-4 py-3">{r.customer_address || '-'}</td>
                <td className="px-4 py-3">{r.product_name}</td>
                <td className="px-4 py-3">{r.device_ids.join(', ') || 'N/A'}</td>
                <td className="px-4 py-3">{r.quantity}</td>
                <td className="px-4 py-3">{formatPrice(r.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}