// src/components/Customers/CustomerHeader.jsx
import React from 'react';

export default function CustomerHeader({ onNewCustomer }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
        Customers
      </h1>
      <button
        onClick={onNewCustomer}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg transition"
      >
        + New Customer
      </button>
    </div>
  );
}