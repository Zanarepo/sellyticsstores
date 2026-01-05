// src/components/returns-management/ReturnsViewToggle.jsx
import React from 'react';
import { LayoutGrid, Table } from 'lucide-react';

export default function ReturnsViewToggle({ view, setView }) {
  return (
    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
      <button
        onClick={() => setView('card')}
        className={`p-2 rounded ${view === 'card' ? 'bg-white dark:bg-slate-900 shadow' : 'text-slate-500'}`}
      >
        <LayoutGrid className="w-5 h-5" />
      </button>
      <button
        onClick={() => setView('table')}
        className={`p-2 rounded ${view === 'table' ? 'bg-white dark:bg-slate-900 shadow' : 'text-slate-500'}`}
      >
        <Table className="w-5 h-5" />
      </button>
    </div>
  );
}