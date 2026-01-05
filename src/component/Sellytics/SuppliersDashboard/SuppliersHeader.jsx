// src/components/Suppliers/SuppliersHeader.jsx
import React from 'react';
import { FaFileCsv, FaFilePdf } from 'react-icons/fa';

export default function SuppliersHeader({ onExportCSV, onExportPDF, onNewInventory }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
        Suppliers Inventory
      </h1>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onNewInventory}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg transition"
        >
          + New Inventory
        </button>
        <button
          onClick={onExportCSV}
          className="flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow transition"
        >
          <FaFileCsv /> CSV
        </button>
        <button
          onClick={onExportPDF}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition"
        >
          <FaFilePdf /> PDF
        </button>
      </div>
    </div>
  );
}