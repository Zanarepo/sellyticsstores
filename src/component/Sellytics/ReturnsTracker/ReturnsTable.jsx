// src/components/returns-management/ReturnsTable.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Archive, Trash2, Edit } from 'lucide-react';
import { useCurrency } from '../../context/currencyContext';

export default function ReturnsTable({
  returns = [],
  selectedIds = [],
  onSelect,
  onDelete,
  onArchive,
  onEdit,
}) {
  const { formatPrice } = useCurrency();
  const [openMenuId, setOpenMenuId] = useState(null);

  if (returns.length === 0) {
    return <div className="text-center py-12 text-slate-500">No returns found.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
      <table className="w-full bg-white dark:bg-slate-900">
        <thead className="bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <tr>
            <th className="p-4 text-left w-10"></th>
            <th className="p-4 text-left">Receipt Code</th>
            <th className="p-4 text-left">Customer</th>
            <th className="p-4 text-left">Product</th>
            <th className="p-4 text-left">Device ID</th>
            <th className="p-4 text-right">Qty</th>
            <th className="p-4 text-right">Amount</th>
            <th className="p-4 text-left">Remark</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Date</th>
            <th className="p-4 text-right w-32">Actions</th>
          </tr>
        </thead>
        <tbody>
          {returns.map((r) => (
            <tr
              key={r.id}
              className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <td className="p-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(r.id)}
                  onChange={(e) => onSelect(r.id, e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600"
                />
              </td>
              <td className="p-4 font-medium">{r.receipt_code}</td>
              <td className="p-4">{r.customer_address || '-'}</td>
              <td className="p-4">{r.product_name}</td>
              <td className="p-4">{r.device_id || '-'}</td>
              <td className="p-4 text-right">{r.qty}</td>
              <td className="p-4 text-right font-medium text-red-600 dark:text-red-400">
                {formatPrice(r.amount)}
              </td>
              <td className="p-4">{r.remark || '-'}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded text-xs ${r.status === 'Processed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                  {r.status}
                </span>
              </td>
              <td className="p-4">{r.returned_date}</td>
              <td className="p-4 text-right relative">
                <button
                  onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)}
                  className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <MoreVertical className="w-4 h-4 text-slate-600" />
                </button>

                {openMenuId === r.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 top-8 z-20 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border"
                    >
                      <button onClick={() => { onArchive(r.id); setOpenMenuId(null); }} className="w-full px-4 py-2 flex items-center gap-2 text-sm hover:bg-slate-50">
                        <Archive className="w-4 h-4" /> Archive
                      </button>
                      <button onClick={() => { onEdit(r); setOpenMenuId(null); }} className="w-full px-4 py-2 flex items-center gap-2 text-sm hover:bg-slate-50">
                        <Edit className="w-4 h-4" /> Edit
                      </button>
                      <button onClick={() => { onDelete(r.id); setOpenMenuId(null); }} className="w-full px-4 py-2 flex items-center gap-2 text-sm text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </motion.div>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}