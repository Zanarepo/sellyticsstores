/**
 * SaleGroups List Component - Table + Card View with Toggle & LocalStorage Persistence
 * Card view matches ProductCard style exactly
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Table, LayoutGrid } from 'lucide-react';
import { useCurrency } from '../../context/currencyContext'; // Adjust path if needed

const VIEW_MODES = {
  TABLE: 'table',
  CARD: 'card'
};

const VIEW_PREFERENCE_KEY = 'saleGroups_view_mode';

export default function SaleGroupsList({ 
  saleGroups, 
  selectedGroup, 
  onSelectGroup,
  currentPage,
  onPageChange,
  itemsPerPage = 20
}) {
  const { formatPrice } = useCurrency();

  // Load saved view preference from localStorage
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem(VIEW_PREFERENCE_KEY);
    return saved === VIEW_MODES.CARD ? VIEW_MODES.CARD : VIEW_MODES.TABLE;
  });

  // Save preference whenever it changes
  useEffect(() => {
    localStorage.setItem(VIEW_PREFERENCE_KEY, viewMode);
  }, [viewMode]);

  const toggleView = () => {
    setViewMode(prev => prev === VIEW_MODES.TABLE ? VIEW_MODES.CARD : VIEW_MODES.TABLE);
  };

  const totalPages = Math.ceil(saleGroups.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGroups = saleGroups.slice(startIndex, startIndex + itemsPerPage);

  if (saleGroups.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500 dark:text-slate-400 text-lg bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        No sale groups found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Toggle + Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleView}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-sm font-medium"
          >
            {viewMode === VIEW_MODES.TABLE ? (
              <>
                <LayoutGrid className="w-4 h-4" />
                Card View
              </>
            ) : (
              <>
                <Table className="w-4 h-4" />
                Table View
              </>
            )}
          </button>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Table View */}
      {viewMode === VIEW_MODES.TABLE && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 z-10">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Sale Group ID</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Total Amount</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Payment Method</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Date</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paginatedGroups.map((group, idx) => (
                  <motion.tr
                    key={group.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => onSelectGroup(group)}
                    className={`cursor-pointer transition-colors ${
                      selectedGroup?.id === group.id
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-indigo-600" />
                        <span className="font-medium">#{group.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatPrice(group.total_amount)}
                    </td>
                    <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                      <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium">
                        {group.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                      {new Date(group.created_at).toLocaleString()}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Card View - One card per row, matching ProductCard style */}
      {viewMode === VIEW_MODES.CARD && (
        <div className="space-y-4">
          <AnimatePresence>
            {paginatedGroups.map((group, index) => (
              <motion.div
                key={group.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => onSelectGroup(group)}
                className={`
                  relative p-4 w-full
                  bg-white dark:bg-slate-800
                  rounded-xl border border-slate-200 dark:border-slate-700
                  transition-all cursor-pointer hover:shadow-lg
                  ${selectedGroup?.id === group.id ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''}
                `}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-100 dark:bg-emerald-900/30">
                    <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate pr-2">
                          Sale Group #{group.id}
                        </h3>

                        <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            Total:
                          </span>{' '}
                          {formatPrice(group.total_amount)}
                        </span>

                        <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            Payment:
                          </span>{' '}
                          {group.payment_method}
                        </span>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(group.created_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}