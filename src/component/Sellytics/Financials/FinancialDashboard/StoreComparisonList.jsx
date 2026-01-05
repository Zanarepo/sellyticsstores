import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, MoreVertical, Trash2, Crown, Search } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';

export default function StoreComparisonList({ storeComparison, bestPerformers, onDelete }) {

  const [showList, setShowList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter stores by search query
  const filteredStores = storeComparison.filter(store =>
    store.storeName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (storeComparison.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Header with Toggle */}
      <button
        onClick={() => setShowList(!showList)}
        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors rounded-t-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
            <Crown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Detailed Comparison</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {filteredStores.length} store{filteredStores.length !== 1 ? 's' : ''}
            </p>
          </div>
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
                placeholder="Search stores..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Store Cards */}
          <div className="space-y-4 p-4 sm:p-6">
            {filteredStores.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400">
                No matching stores found
              </p>
            ) : (
              filteredStores.map((store) => (
                <StoreComparisonCard
                  key={store.storeName}
                  store={store}
                  bestPerformers={bestPerformers}
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

// Individual Store Comparison Card
function StoreComparisonCard({ store, bestPerformers, onDelete }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const { formatPrice } = useCurrency();

  const handleDelete = () => {
    if (window.confirm(`Remove ${store.storeName} from comparison?`)) {
      onDelete?.(store);
    }
    setShowDropdown(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 hover:shadow-md transition-all relative"
    >
      {/* Top row: Icon + Store Name + Menu */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                {store.storeName}
              </h3>
            </div>
          </div>
        </div>

        {/* MoreVertical Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(prev => !prev);
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
                Delete Store
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 text-sm">
        <div>
          <p className="text-slate-500 dark:text-slate-400">Sales</p>
          <p className={`font-medium ${store.storeName === bestPerformers.totalSales ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
            {formatPrice(store.totalSales)}
            {store.storeName === bestPerformers.totalSales && <Crown className="w-4 h-4 inline ml-1" />}
          </p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">Expenses</p>
          <p className={`font-medium ${store.storeName === bestPerformers.totalExpenses ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
            {formatPrice(store.totalExpenses)}
            {store.storeName === bestPerformers.totalExpenses && <Crown className="w-4 h-4 inline ml-1" />}
          </p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">COGS</p>
          <p className={`font-medium ${store.storeName === bestPerformers.totalCOGS ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
            {formatPrice(store.totalCOGS)}
            {store.storeName === bestPerformers.totalCOGS && <Crown className="w-4 h-4 inline ml-1" />}
          </p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">Debts</p>
          <p className={`font-medium ${store.storeName === bestPerformers.totalDebts ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
            {formatPrice(store.totalDebts)}
            {store.storeName === bestPerformers.totalDebts && <Crown className="w-4 h-4 inline ml-1" />}
          </p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">Profit</p>
          <p className={`font-medium ${store.storeName === bestPerformers.totalProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
            {formatPrice(store.totalProfit)}
            {store.storeName === bestPerformers.totalProfit && <Crown className="w-4 h-4 inline ml-1" />}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="text-slate-500 dark:text-slate-400">Margin</p>
          <p className={`font-medium ${store.storeName === bestPerformers.profitMargin ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
            {store.profitMargin}%
            {store.storeName === bestPerformers.profitMargin && <Crown className="w-4 h-4 inline ml-1" />}
          </p>
        </div>
      </div>
    </motion.div>
  );
}