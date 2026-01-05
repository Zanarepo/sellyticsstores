import React from 'react';
import { LayoutGrid, Table } from 'lucide-react';

export default function ViewToggle({ view, setView }) {
  const saveView = (newView) => {
    setView(newView);
    localStorage.setItem('staffViewPreference', newView);
  };

  return (
    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
      <button
        onClick={() => saveView('card')}
        className={`p-2.5 rounded-md transition-colors ${view === 'card' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
      >
        <LayoutGrid className="w-5 h-5" />
      </button>
      <button
        onClick={() => saveView('table')}
        className={`p-2.5 rounded-md transition-colors ${view === 'table' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
      >
        <Table className="w-5 h-5" />
      </button>
    </div>
  );
}