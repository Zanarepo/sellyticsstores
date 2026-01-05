import React from 'react';
import { Store, Calendar, Filter, Download, Plus, RefreshCw } from 'lucide-react';


export default function ReconciliationFilters({
  stores,
  storeId,
  setStoreId,
  timePeriod,
  setTimePeriod,
  checkDate,
  setCheckDate,
  paymentMethods,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  onApplyFilters,
  onAddCheck,
  onExportCSV,
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
            <p className="text-sm text-slate-500 dark:text-slate-400">Configure your reconciliation view</p>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Store Select */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Store className="w-4 h-4" />
            Store
          </label>
          <select
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
            value={storeId}
            onChange={(e) => {
              const newStoreId = e.target.value;
              setStoreId(newStoreId);
              localStorage.setItem('store_id', newStoreId);
              setSelectedPaymentMethod('');
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
            Period
          </label>
          <select
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
            value={timePeriod}
            onChange={(e) => {
              setTimePeriod(e.target.value);
              setSelectedPaymentMethod('');
            }}
            disabled={isLoading}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Calendar className="w-4 h-4" />
            Date
          </label>
          <input
            type="date"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
            value={checkDate}
            onChange={(e) => {
              setCheckDate(e.target.value);
              setSelectedPaymentMethod('');
            }}
            disabled={isLoading}
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Filter className="w-4 h-4" />
            Payment
          </label>
          <select
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            disabled={isLoading}
          >
            <option value="">All Methods</option>
            {paymentMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 opacity-0">Actions</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onApplyFilters}
              disabled={isLoading || !storeId || !checkDate}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl font-medium transition-all hover:shadow-lg disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onAddCheck}
              disabled={isLoading || !storeId || !checkDate}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl font-medium transition-all hover:shadow-lg disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 rounded-b-2xl">
        <button
          onClick={onExportCSV}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export to CSV
        </button>
      </div>
    </div>
  );
}