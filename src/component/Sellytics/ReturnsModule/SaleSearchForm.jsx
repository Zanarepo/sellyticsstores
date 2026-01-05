/**
 * Sale Search Form Component
 */
import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

export default function SaleSearchForm({ onSearch, searching }) {
  const [receiptId, setReceiptId] = useState('');
  const [deviceId, setDeviceId] = useState('');

  const handleSearch = () => {
    onSearch(receiptId, deviceId);
  };

  const handleClear = () => {
    setReceiptId('');
    setDeviceId('');
    onSearch('', '');
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Search className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Search Sales
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Receipt ID
          </label>
          <input
            type="text"
            value={receiptId}
            onChange={(e) => setReceiptId(e.target.value)}
            placeholder="e.g., RCPT-123-456789"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Device ID
          </label>
          <input
            type="text"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            placeholder="e.g., IMEI123456"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSearch}
          disabled={searching || (!receiptId && !deviceId)}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {searching ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Search
            </>
          )}
        </button>

        {(receiptId || deviceId) && (
          <button
            onClick={handleClear}
            className="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}