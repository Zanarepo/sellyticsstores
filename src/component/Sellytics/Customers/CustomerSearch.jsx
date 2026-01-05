// src/components/Customers/CustomerSearch.jsx
import React from 'react';

export default function CustomerSearch({ searchTerm, setSearchTerm, resetPage }) {
  return (
    <input
      type="text"
      placeholder="Search by name..."
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        resetPage();
      }}
      className="w-full px-5 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800"
    />
  );
}