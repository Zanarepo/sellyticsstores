// src/components/returns-management/ReturnsCard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ReceiptText, MoreVertical, Archive, Trash2 , Edit} from 'lucide-react';
import { useCurrency } from '../../context/currencyContext';

export default function ReturnsCard({ returnItem, isSelected, onSelect, onDelete, onArchive, onEdit }) {
  const { formatPrice } = useCurrency();
  const [menuOpen, setMenuOpen] = useState(false);

  const statusClass = returnItem.status === 'Processed' 
    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`w-full bg-white dark:bg-slate-900 rounded-2xl border-2 transition-all hover:shadow-xl relative overflow-hidden ${
        isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(returnItem.id, e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${statusClass}`}>
              {returnItem.status || 'Pending'}
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <MoreVertical className="w-5 h-5 text-slate-500" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-10 z-20 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border"
                >
                  <button onClick={() => { onArchive(returnItem.id); setMenuOpen(false); }} className="w-full px-4 py-3 flex items-center gap-3 text-left text-sm hover:bg-slate-50">
                    <Archive className="w-4 h-4" /> Archive
                  </button>
                  <button onClick={() => { onEdit(returnItem); setMenuOpen(false); }} className="w-full px-4 py-3 flex items-center gap-3 text-left text-sm hover:bg-slate-50">
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => { onDelete(returnItem.id); setMenuOpen(false); }} className="w-full px-4 py-3 flex items-center gap-3 text-left text-sm text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-start gap-3">
            <ReceiptText className="w-5 h-5 text-slate-400 mt-0.5" />
            <p className="text-base text-slate-700 dark:text-slate-300">
              {returnItem.receipt_code} - {returnItem.product_name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Returned Value</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">
              {formatPrice(returnItem.amount)}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">Quantity</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {returnItem.qty}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <p><span className="font-medium">Customer:</span> {returnItem.customer_address || 'N/A'}</p>
          <p><span className="font-medium">Device ID:</span> {returnItem.device_id || 'N/A'}</p>
          <p><span className="font-medium">Remark:</span> {returnItem.remark || 'N/A'}</p>
          <p><span className="font-medium">Date:</span> {returnItem.returned_date}</p>
        </div>
      </div>
    </motion.div>
  );
}