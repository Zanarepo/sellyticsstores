/**
 * FilterDrawer Component
 * Filter and sort options drawer
 */
import React from 'react';
import { X, Check, SortAsc, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const FILTERS = [
  { key: 'all', label: 'All Products', description: 'Show all products' },
  { key: 'unique', label: 'Unique Items', description: 'Products tracked by IMEI/Serial' },
  { key: 'standard', label: 'Standard Items', description: 'Quantity-based products' },
  { key: 'low-stock', label: 'Low Stock', description: 'Products with 5 or fewer items' }
];

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest First' },
  { key: 'name', label: 'Name (A-Z)' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' }
];

export default function FilterDrawer({ 
  activeFilter, 
  sortBy, 
  onFilterChange, 
  onSortChange, 
  onClose 
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
              <Filter className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Filter & Sort
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Filter by Type
            </h3>
            <div className="space-y-2">
              {FILTERS.map(filter => (
                <button
                  key={filter.key}
                  onClick={() => onFilterChange(filter.key)}
                  className={`
                    w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all
                    ${activeFilter === filter.key
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }
                  `}
                >
                  <div className="text-left">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {filter.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {filter.description}
                    </div>
                  </div>
                  {activeFilter === filter.key && (
                    <Check className="w-5 h-5 text-indigo-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <SortAsc className="w-4 h-4" />
              Sort By
            </h3>
            <div className="space-y-2">
              {SORT_OPTIONS.map(option => (
                <button
                  key={option.key}
                  onClick={() => onSortChange(option.key)}
                  className={`
                    w-full flex items-center justify-between p-3 rounded-xl border transition-all
                    ${sortBy === option.key
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }
                  `}
                >
                  <span className="font-medium text-slate-900 dark:text-white">
                    {option.label}
                  </span>
                  {sortBy === option.key && (
                    <Check className="w-4 h-4 text-indigo-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
          >
            Apply Filters
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}