import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Package, Trash2, MoreVertical } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';

export default function LedgerCard({ entry, onDelete, onArchive, isSelected, onSelect }) {
  const { formatPrice } = useCurrency();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const accountColors = {
    'Cash': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'Revenue': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'Inventory': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    'COGS': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    'Accounts Receivable': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    'Accounts Payable': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  const accountColorClass = accountColors[entry.account] || 'bg-slate-100 text-slate-800 dark:bg-slate-700/50 dark:text-slate-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`w-full bg-white dark:bg-slate-900 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl relative overflow-hidden ${
        isSelected
          ? 'border-indigo-500 shadow-xl ring-2 ring-indigo-500/20'
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="p-6">
        {/* Top Row: Checkbox + Account Badge + Date + MoreVertical Menu */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(entry.id, e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${accountColorClass}`}>
              {entry.account}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Calendar className="w-4 h-4" />
              {new Date(entry.transaction_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>

            {/* MoreVertical Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>

              {isMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  {/* Dropdown Menu */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute right-0 top-10 z-20 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                  >
                    
                     {/* Dropdown Menu 
                    <button
                      onClick={() => {
                        onArchive(entry.id);
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left text-sm"
                    >
                      <Archive className="w-4 h-4" />
                      Archive Entry
                    </button>

*/}

                    <button
                      onClick={() => {
                        onDelete(entry.id);
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Entry
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
              {entry.description || 'No description provided'}
            </p>
          </div>
        </div>

        {/* Debit / Credit Amounts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-5 border border-green-200 dark:border-green-800/50">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">Debit (In)</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {entry.debit ? formatPrice(entry.debit) : '—'}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 border border-red-200 dark:border-red-800/50">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Credit (Out)</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">
              {entry.credit ? formatPrice(entry.credit) : '—'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}