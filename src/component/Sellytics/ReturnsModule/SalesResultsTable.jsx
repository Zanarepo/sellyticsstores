/**
 * Sales Results Table Component
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, CheckSquare, Square } from 'lucide-react';
import { useCurrency } from '../../context/currencyContext';

export default function SalesResultsTable({ sales, onSelectItems }) {
  const { formatPrice } = useCurrency();
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === sales.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sales.map(s => s.id));
    }
  };

  const handleAddReturns = () => {
    const selected = sales.filter(s => selectedIds.includes(s.id));
    onSelectItems(selected);
    setSelectedIds([]);
  };

  if (sales.length === 0) return null;

  const allSelected = selectedIds.length === sales.length && sales.length > 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-600" />
          Found {sales.length} Item{sales.length !== 1 ? 's' : ''}
        </h3>
        {selectedIds.length > 0 && (
          <button
            onClick={handleAddReturns}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Add {selectedIds.length} Return{selectedIds.length !== 1 ? 's' : ''}
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-100 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  {allSelected ? (
                    <CheckSquare className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Receipt</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Product</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Device ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Qty</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Customer</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {sales.map((sale) => (
                <motion.tr
                  key={sale.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer"
                  onClick={() => toggleSelect(sale.id)}
                >
                  <td className="px-4 py-3">
                    {selectedIds.includes(sale.id) ? (
                      <CheckSquare className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900 dark:text-white font-medium">
                    {sale.receipt_code}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                    {sale.product_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                    {sale.device_id || <span className="text-slate-400">N/A</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                    {sale.quantity}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 font-semibold">
                    {formatPrice}{sale.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                    {sale.customer_address || <span className="text-slate-400">N/A</span>}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}