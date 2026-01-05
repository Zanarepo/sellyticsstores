import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, MoreVertical, Trash2, Search, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default function SalesList({ sales, onDelete }) {
  const [showList, setShowList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter sales by search query
  const filteredSales = sales.filter(
    (sale) =>
      sale.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.payment_method?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (sales.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 text-center">
        <p className="text-slate-500 dark:text-slate-400">No sales found for the selected filters</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Header with Toggle */}
      <button
        onClick={() => setShowList(!showList)}
        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors rounded-t-2xl"
      >
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white text-left">All Sales</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-left mt-1">
            {filteredSales.length} transaction{filteredSales.length !== 1 ? 's' : ''}
          </p>
        </div>
        {showList ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {showList && (
        <div className="border-t border-slate-200 dark:border-slate-700">
          {/* Search Bar */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer or payment method..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Sales Cards */}
          <div className="space-y-4 p-4 sm:p-6">
            {filteredSales.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400">
                No matching sales found
              </p>
            ) : (
              filteredSales.map((sale) => (
                <SalesCard
                  key={sale.id}
                  sale={sale}
                  onDelete={onDelete}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Individual Sale Card
function SalesCard({ sale, onDelete }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      onDelete(sale.id);
    }
    setShowDropdown(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 hover:shadow-md transition-all relative"
    >
      {/* Top row: Icon + Info + Menu */}
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon + Info */}
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                {sale.customer_name || 'N/A'}
              </h3>
              {sale.payment_method && (
                <span className="inline-flex px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                  {sale.payment_method}
                </span>
              )}
            </div>

            <div className="text-sm text-slate-500 dark:text-slate-400">
              <Calendar className="inline w-4 h-4 mr-1 text-slate-400" />
              {format(new Date(sale.sold_at), 'MMM dd, yyyy • HH:mm')}
            </div>
          </div>
        </div>

        {/* MoreVertical Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown((prev) => !prev);
            }}
            className="p-2 -mr-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>

          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden"
            >
              <button
                onClick={handleDelete}
                className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Sale
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom row: Amount */}
      <div className="mt-4 flex items-center gap-2 text-lg font-semibold text-emerald-600 dark:text-emerald-400">
        <DollarSign className="w-5 h-5" />
        {sale.amount}
      </div>
    </motion.div>
  );
}