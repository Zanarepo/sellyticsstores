import React from 'react';
import { Store, Calendar, Filter, TrendingUp } from 'lucide-react';

export default function FinancialFilters({
  stores,
  storeId,
  setStoreId,
  timeFilter,
  setTimeFilter,
  timeGranularity,
  setTimeGranularity,
  metricFilter,
  setMetricFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onApply,
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
            <p className="text-sm text-slate-500 dark:text-slate-400">Configure your financial view</p>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Store */}
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

        {/* Time Period */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Calendar className="w-4 h-4" />
            Time Period
          </label>
          <select
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            disabled={isLoading}
          >
            <option value="30d">Last 30 Days</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {/* Time Granularity */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <TrendingUp className="w-4 h-4" />
            Sales View
          </label>
          <select
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
            value={timeGranularity}
            onChange={(e) => setTimeGranularity(e.target.value)}
            disabled={isLoading}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        

        {/* Metric Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Filter className="w-4 h-4" />
            Metric
          </label>
          <select
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
            value={metricFilter}
            onChange={(e) => setMetricFilter(e.target.value)}
            disabled={isLoading}
          >
            <option value="All">All Metrics</option>
            <option value="Sales">Sales</option>
            <option value="Expenses">Expenses</option>
            <option value="COGS">Cost of Goods</option>
            <option value="Debts">Debts</option>
            <option value="Comparison">Compare Stores</option>
          </select>
        </div>

        {/* Custom Date Inputs */}
        {timeFilter === 'custom' && (
          <>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Calendar className="w-4 h-4" />
                Start Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Calendar className="w-4 h-4" />
                End Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </>
        )}
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 rounded-b-2xl">
        <button
          onClick={onApply}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl font-medium transition-all hover:shadow-lg disabled:cursor-not-allowed"
        >
          <Filter className="w-4 h-4" />
          Apply Filters
        </button>
      </div>
    </div>
  );
}