// components/inventory-valuation/InventoryTable.jsx
import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCurrency } from '../../../context/currencyContext';

export default function InventoryTable({ items, selectedIds, onSelect, onDelete, onArchive }) {
  const { formatPrice } = useCurrency();
  const [openMenuId, setOpenMenuId] = useState(null);

  if (items.length === 0) {
    return <div className="text-center py-12 text-slate-500">No items found.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
      <table className="w-full bg-white dark:bg-slate-900">
        <thead className="bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <tr>
            <th className="p-4 text-left w-12"><input type="checkbox" disabled /></th>
            <th className="p-4 text-left">Product</th>
            <th className="p-4 text-right">Quantity</th>
            <th className="p-4 text-right">Purchase Price</th>
            <th className="p-4 text-right">Total Value</th>
            <th className="p-4 text-center">Status</th>
            <th className="p-4 text-right w-20">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => {
            const hasPrice = item.purchase_price && item.purchase_price > 0;
            const total = item.quantity * (item.purchase_price || 0);
            return (
              <tr key={item.id} className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={(e) => onSelect(item.id, e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                </td>
                <td className="p-4 font-medium">{item.product_name}</td>
                <td className="p-4 text-right">{item.quantity}</td>
                <td className="p-4 text-right">{hasPrice ? formatPrice(item.purchase_price) : '—'}</td>
                <td className="p-4 text-right font-medium text-indigo-600 dark:text-indigo-400">
                  {hasPrice ? formatPrice(total) : '—'}
                </td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${hasPrice ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} dark:${hasPrice ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                    {hasPrice ? 'Priced' : 'Missing'}
                  </span>
                </td>
                <td className="p-4 text-right relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                    className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openMenuId === item.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-4 top-10 z-20 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-lg border"
                      >
                        <button onClick={() => { onArchive(item.id); setOpenMenuId(null); }} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700">Archive</button>
                        <button onClick={() => { onDelete(item.id); setOpenMenuId(null); }} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">Delete</button>
                      </motion.div>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}