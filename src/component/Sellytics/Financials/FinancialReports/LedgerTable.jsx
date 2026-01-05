import React, { useState } from 'react';
import { useCurrency } from '../../../context/currencyContext';
import { Trash2, Archive, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LedgerTable({
  entries = [],
  selectedIds = [],
  onSelect,
  onDelete,
  onArchive,
}) {
  const { formatPrice } = useCurrency();
  const [openMenuId, setOpenMenuId] = useState(null);

  const accountColors = {
    Cash: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Revenue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    Inventory: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    COGS: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    'Accounts Receivable': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    'Accounts Payable': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  if (entries.length === 0) {
    return (
      <div className="text-center text-slate-500 py-12">
        No transactions found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
      <table className="w-full border-collapse bg-white dark:bg-slate-900">
        <thead className="bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <tr>
            <th className="p-3 text-left w-10"></th>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-left">Account</th>
            <th className="p-3 text-left">Description</th>
            <th className="p-3 text-right">Debit</th>
            <th className="p-3 text-right">Credit</th>
            <th className="p-3 text-right w-32">Actions</th>
          </tr>
        </thead>

        <tbody>
          {entries.map((entry) => {
            const accountClass = accountColors[entry.account] || 
              'bg-slate-100 text-slate-800 dark:bg-slate-700/50 dark:text-slate-400';
            return (
              <tr
                key={entry.id}
                className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(entry.id)}
                    onChange={(e) => onSelect(entry.id, e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>

                <td className="p-3 text-sm">{new Date(entry.transaction_date).toLocaleDateString()}</td>

                <td className={`p-3 font-medium text-sm`}>
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${accountClass}`}>
                    {entry.account}
                  </span>
                </td>

                <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                  {entry.description || '—'}
                </td>

                <td className="p-3 text-right text-green-600 font-medium">
                  {entry.debit ? formatPrice(entry.debit) : '—'}
                </td>

                <td className="p-3 text-right text-red-600 font-medium">
                  {entry.credit ? formatPrice(entry.credit) : '—'}
                </td>

                <td className="p-3 text-right relative">
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === entry.id ? null : entry.id)
                    }
                    className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </button>

                  {openMenuId === entry.id && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenuId(null)}
                      />
                      {/* Dropdown Menu */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="absolute right-0 top-8 z-20 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                      >
                        <button
                          onClick={() => {
                            onArchive(entry.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm"
                        >
                          <Archive className="w-4 h-4" />
                          Archive
                        </button>
                        <button
                          onClick={() => {
                            onDelete(entry.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
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
