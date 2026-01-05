// components/activity/ViewToggle.jsx
import React from 'react';
import { LayoutGrid, Table } from 'lucide-react';

export default function ViewToggle({ view, setView }) {
  const toggle = (newView) => {
    setView(newView);
    localStorage.setItem('activityLogView', newView);
  };

  return (
    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
      <button
        onClick={() => toggle('card')}
        className={`p-2.5 rounded-md transition-all ${view === 'card' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
        title="Card View"
      >
        <LayoutGrid className="w-5 h-5" />
      </button>
      <button
        onClick={() => toggle('table')}
        className={`p-2.5 rounded-md transition-all ${view === 'table' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
        title="Table View"
      >
        <Table className="w-5 h-5" />
      </button>
    </div>
  );
}