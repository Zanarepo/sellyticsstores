// components/inventory-valuation/InventoryList.jsx
import React from 'react';
import InventoryCard from './InventoryCard';
import InventoryTable from './InventoryTable';

export default function InventoryList({
  items,
  selectedIds,
  onSelect,
  onDelete,
  onArchive,
  view,
  isLoading,
}) {
  if (isLoading) {
    return <div className="text-center py-12 text-slate-500">Loading inventory...</div>;
  }

  if (items.length === 0) {
    return <div className="text-center py-12 text-slate-500">No items match your filters.</div>;
  }

  return (
    <div className="space-y-6">
      {view === 'table' ? (
        <InventoryTable
          items={items}
          selectedIds={selectedIds}
          onSelect={onSelect}
          onDelete={onDelete}
          onArchive={onArchive}
        />
      ) : (
        <>
          {items.map(item => (
            <InventoryCard
              key={item.id}
              item={item}
              isSelected={selectedIds.includes(item.id)}
              onSelect={onSelect}
              onDelete={onDelete}
              onArchive={onArchive}
            />
          ))}
        </>
      )}
    </div>
  );
}