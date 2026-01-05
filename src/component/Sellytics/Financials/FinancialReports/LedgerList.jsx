import React from 'react';
import { LayoutGrid, ListChecks } from 'lucide-react'; // modern icons
import LedgerCard from './LedgerCard';
import LedgerTable from './LedgerTable';

export default function LedgerList({ entries, selectedIds, onSelect, onDelete, onArchive, view, setView }) {
  return (
    <div className="space-y-6">
      {/* Toggle Buttons with Modern Icons */}
      <div className="flex justify-end mb-4 gap-2">
        <button
          onClick={() => setView('card')}
          className={`p-2 rounded ${view === 'card' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
          title="Card View"
        >
          <LayoutGrid className="w-5 h-5" />
        </button>
        <button
          onClick={() => setView('table')}
          className={`p-2 rounded ${view === 'table' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
          title="Table View"
        >
          <ListChecks className="w-5 h-5" />
        </button>
      </div>

      {view === 'table' ? (
        <LedgerTable
          entries={entries}
          selectedIds={selectedIds}
          onSelect={onSelect}
          onDelete={onDelete}
          onArchive={onArchive}
        />
      ) : (
        <div className="grid gap-6">
          {entries.map(entry => (
            <LedgerCard
              key={entry.id}
              entry={entry}
              isSelected={selectedIds.includes(entry.id)}
              onSelect={onSelect}
              onDelete={onDelete}
              onArchive={onArchive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
