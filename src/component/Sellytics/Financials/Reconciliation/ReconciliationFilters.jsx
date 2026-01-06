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
    <div className="bg-white dark:bg-slate-800 sm:rounded-2xl border-y sm:border-x border-slate-200 dark:border-slate-700 p-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        
        {/* Store Select */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
            <Store className="w-3.5 h-3.5" />
            Store
          </label>
          <select
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
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
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Period
          </label>
          <select
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
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
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Date
          </label>
          <input
            type="date"
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
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
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
            <Filter className="w-3.5 h-3.5" />
            Payment
          </label>
          <select
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
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

        {/* Main Actions */}
        <div className="col-span-2 sm:col-span-1 md:col-span-2 lg:col-span-2">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block opacity-0">Actions</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onApplyFilters}
              disabled={isLoading || !storeId || !checkDate}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Apply</span>
            </button>
            <button
              onClick={onAddCheck}
              disabled={isLoading || !storeId || !checkDate}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Check</span>
            </button>
            <button
              onClick={onExportCSV}
              disabled={isLoading}
              className="col-span-2 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors rounded-lg"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}