import React from 'react';
import { LayoutGrid, Table } from 'lucide-react';
import { useLedgerView } from './useLedgerView';

export default function LedgerViewToggle() {
  const [view, setView] = useLedgerView();

  return (
    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
      <button
        type="button"
        onClick={() => setView('card')}
        className={`p-2 rounded-lg ${
          view === 'card'
            ? 'bg-white dark:bg-slate-900 shadow'
            : 'text-slate-500'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => setView('table')}
        className={`p-2 rounded-lg ${
          view === 'table'
            ? 'bg-white dark:bg-slate-900 shadow'
            : 'text-slate-500'
        }`}
      >
        <Table className="w-4 h-4" />
      </button>
    </div>
  );
}
