// components/inventory-valuation/InventoryFilters.jsx
import React from 'react';
import { Store, Search, Filter, X } from 'lucide-react';

export default function InventoryFilters({
  stores,
  storeId,
  setStoreId,
  searchTerm,
  setSearchTerm,
  detailFilter,
  setDetailFilter,
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
            <p className="text-sm text-slate-500 dark:text-slate-400">Refine your inventory view</p>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Store className="w-4 h-4" />
            Store
          </label>
          <select
            value={storeId}
            onChange={(e) => {
              const val = e.target.value;
              setStoreId(val);
              if (val) localStorage.setItem('store_id', val);
            }}
            disabled={isLoading}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          >
            <option value="">Select a store</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.shop_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Search className="w-4 h-4" />
            Search Product
          </label>
          <input
            type="text"
            placeholder="e.g. Shirt, Rice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Filter className="w-4 h-4" />
            Price Status
          </label>
          <select
            value={detailFilter}
            onChange={(e) => setDetailFilter(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          >
            <option value="all">All Items</option>
            <option value="complete">With Purchase Price</option>
            <option value="incomplete">Missing Price</option>
          </select>
        </div>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 rounded-b-2xl">
        <button
          onClick={clearFilters}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          Clear Filters
        </button>
      </div>
    </div>
  );
}