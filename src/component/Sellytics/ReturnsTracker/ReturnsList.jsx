// src/components/returns-management/ReturnsList.jsx
import React from 'react';
import ReturnsCard from './ReturnsCard';
import ReturnsTable from './ReturnsTable';

export default function ReturnsList({
  returns = [],               // ← Safety fallback
  selectedIds = [],           // ← Critical: default to empty array
  onSelect = () => {},        // ← Prevent crashes on missing handlers
  onDelete = () => {},
  onArchive = () => {},
  onEdit = () => {},
  view = 'card',
  isLoading = false,
}) {
  if (isLoading) {
    return <div className="text-center py-12 text-slate-500">Loading returns...</div>;
  }

  if (returns.length === 0) {
    return <div className="text-center py-12 text-slate-500">No returns found.</div>;
  }

  return (
    <div className="space-y-6">
      {view === 'table' ? (
        <ReturnsTable
          returns={returns}
          selectedIds={selectedIds}
          onSelect={onSelect}
          onDelete={onDelete}
          onArchive={onArchive}
          onEdit={onEdit}
        />
      ) : (
        <div className="space-y-6">
          {returns.map(r => (
            <ReturnsCard
              key={r.id}
              returnItem={r}
              isSelected={Array.isArray(selectedIds) && selectedIds.includes(r.id)}
              onSelect={onSelect}
              onDelete={onDelete}
              onArchive={onArchive}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}