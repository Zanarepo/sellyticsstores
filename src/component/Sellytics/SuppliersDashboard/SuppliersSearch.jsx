// src/components/Suppliers/SuppliersSearch.jsx
import React from 'react';

export default function SuppliersSearch({ search, setSearch }) {
  return (
    <input
      type="text"
      placeholder="Search by supplier, device name, or IDs..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full px-5 py-4 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 mb-6"
    />
  );
}