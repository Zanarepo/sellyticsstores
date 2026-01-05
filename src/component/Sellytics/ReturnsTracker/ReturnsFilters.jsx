// src/components/returns-management/ReturnsFilters.jsx
import React from 'react';
import { Search, ReceiptText, Smartphone } from 'lucide-react';

export default function ReturnsFilters({
  receiptIdQuery,
  setReceiptIdQuery,
  deviceIdQuery,
  setDeviceIdQuery,
  searchTerm,
  setSearchTerm,
  isLoading,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border shadow-sm p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="flex gap-2 mb-2 font-medium">
            <ReceiptText className="w-4 h-4" />
            Receipt ID
          </label>
          <input
            value={receiptIdQuery}
            onChange={e => setReceiptIdQuery(e.target.value)}
            placeholder="RCPT-4600-1766455903120"
            disabled={isLoading}
            className="w-full px-4 py-3 border rounded-xl dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="flex gap-2 mb-2 font-medium">
            <Smartphone className="w-4 h-4" />
            Device ID
          </label>
          <input
            value={deviceIdQuery}
            onChange={e => setDeviceIdQuery(e.target.value)}
            placeholder="Enter Device ID"
            disabled={isLoading}
            className="w-full px-4 py-3 border rounded-xl dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="flex gap-2 mb-2 font-medium">
          <Search className="w-4 h-4" />
          Search Returns
        </label>
        <input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Customer, product, status..."
          className="w-full px-4 py-3 border rounded-xl dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
}