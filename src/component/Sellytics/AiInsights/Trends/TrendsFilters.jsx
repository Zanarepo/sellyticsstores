/**
 * Trends Filters Component
 */
import React from 'react';
import { Calendar, Filter, BarChart3 } from 'lucide-react';

export default function TrendsFilters({ selectedMonth, setSelectedMonth, rangeFilter, setRangeFilter }) {
  const monthOptions = [];
  const currentDate = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const value = date.toISOString().slice(0, 7);
    const label = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    monthOptions.push({ value, label });
  }

  const rangeOptions = [
    { value: 'single', label: 'Selected Month' },
    { value: 'last3', label: 'Last 3 Months' },
    { value: 'last6', label: 'Last 6 Months' },
    { value: 'last9', label: 'Last 9 Months' },
    { value: 'last12', label: 'Last 12 Months' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Calendar className="w-4 h-4" />
            Select Month
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <BarChart3 className="w-4 h-4" />
            Date Range
          </label>
          <select
            value={rangeFilter}
            onChange={(e) => setRangeFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          >
            {rangeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}