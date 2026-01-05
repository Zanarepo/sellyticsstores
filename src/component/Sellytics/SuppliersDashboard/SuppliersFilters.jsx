// src/components/Suppliers/SuppliersFilters.jsx
import React from 'react';
//import { FaFilter } from 'react-icons/fa';

export default function SuppliersFilters({
  showFilters,
 //setShowFilters,
  filters,
  setFilter,
  suppliers,
  clearFilters,
}) {
  return (
    <div className="mb-6">
      
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Supplier</label>
              <select
                value={filters.supplier_name}
                onChange={(e) => setFilter('supplier_name', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl dark:bg-slate-700"
              >
                {suppliers.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Device Name</label>
              <input
                type="text"
                value={filters.device_name}
                onChange={(e) => setFilter('device_name', e.target.value)}
                placeholder="Filter by name..."
                className="w-full px-4 py-3 border rounded-xl dark:bg-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Min Quantity</label>
              <input
                type="number"
                min="0"
                value={filters.qty_min}
                onChange={(e) => setFilter('qty_min', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl dark:bg-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Quantity</label>
              <input
                type="number"
                min="0"
                value={filters.qty_max}
                onChange={(e) => setFilter('qty_max', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl dark:bg-slate-700"
              />
            </div>
          </div>
          <div className="mt-4 text-right">
            <button
              onClick={clearFilters}
              className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}