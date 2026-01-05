import React from 'react';
import { Store, Search, Calendar, Filter, X } from 'lucide-react';

export default function LedgerFilters({
  stores,
  storeId,
  setStoreId,
  searchTerm,
  setSearchTerm,
  accountFilter,
  setAccountFilter,
  dateRange,
  setDateRange,
  clearFilters,
  isLoading,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
            <Filter className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Filters & Controls</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Customize your ledger view</p>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Store Selector */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Store className="w-4 h-4" />
            Store
          </label>
          <select
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
            value={storeId}
            onChange={(e) => {
              setStoreId(e.target.value);
              localStorage.setItem('store_id', e.target.value);
            }}
            disabled={isLoading}
          >
            <option value="">Select store</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.shop_name}</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Search className="w-4 h-4" />
            Search
          </label>
          <input
            type="text"
            placeholder="Search description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
            disabled={isLoading}
          />
        </div>

        {/* Account Type Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Filter className="w-4 h-4" />
            Account Type
          </label>
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
            disabled={isLoading}
          >
            <option value="">All Types</option>
            <option value="Cash">Cash</option>
            <option value="Revenue">Revenue</option>
            <option value="Inventory">Inventory</option>
            <option value="COGS">COGS</option>
            <option value="Accounts Receivable">Accounts Receivable</option>
            <option value="Accounts Payable">Accounts Payable</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Calendar className="w-4 h-4" />
            Start Date
          </label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
            disabled={isLoading}
          />
        </div>

        {/* End Date */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Calendar className="w-4 h-4" />
            End Date
          </label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 rounded-b-2xl flex gap-3">
        <button
          onClick={clearFilters}
          disabled={isLoading}
          className="inline-flex items-center text-white gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-slate-700 dark:hover:bg-slate-600  dark:text-slate-300 rounded-xl font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          Clear Filters
        </button>
      </div>
    </div>
  );
}