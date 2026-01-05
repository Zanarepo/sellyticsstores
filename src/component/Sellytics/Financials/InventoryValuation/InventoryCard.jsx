// components/inventory-valuation/InventoryCard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, MoreVertical, Archive, Trash2 } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';

export default function InventoryCard({ item, isSelected, onSelect, onDelete, onArchive }) {
  const { formatPrice } = useCurrency();
  const [menuOpen, setMenuOpen] = useState(false);

  const hasPrice = item.purchase_price && item.purchase_price > 0;
  const badgeClass = hasPrice
    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';

  const totalValue = item.quantity * (item.purchase_price || 0);

  return (
    <motion.div
      layout
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
        {/* Top Row: Checkbox + Status Badge + Product Name + Menu */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(item.id, e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${badgeClass}`}>
              {hasPrice ? 'Priced' : 'No Price'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-slate-400" />
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {item.product_name}
              </p>
            </div>

            {/* More Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute right-0 top-10 z-20 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        onArchive(item.id);
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left text-sm"
                    >
                      <Archive className="w-4 h-4" />
                      Archive Item
                    </button>
                    <button
                      onClick={() => {
                        onDelete(item.id);
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Item
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Quantity */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              Quantity in Stock
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {item.quantity.toLocaleString()}
            </p>
          </div>

          {/* Purchase Price */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-5 border border-amber-200 dark:border-amber-800/50">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">
              Purchase Price (per unit)
            </p>
            <p className="text-3xl font-bold text-amber-800 dark:text-amber-300">
              {hasPrice ? formatPrice(item.purchase_price) : '—'}
            </p>
          </div>

          {/* Total Value */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-5 border border-indigo-200 dark:border-indigo-800/50">
            <p className="text-sm font-medium text-indigo-700 dark:text-indigo-400 mb-1">
              Total Value
            </p>
            <p className="text-3xl font-bold text-indigo-800 dark:text-indigo-300">
              {hasPrice ? formatPrice(totalValue) : '—'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}