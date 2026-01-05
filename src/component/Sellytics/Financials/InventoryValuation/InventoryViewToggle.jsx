
import React, { useEffect } from 'react';
import { ListChecks, LayoutGrid } from 'lucide-react';

const STORAGE_KEY = 'inventory_view_type';

export default function InventoryViewToggle({ view, setView }) {
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setView(saved);
  }, [setView]);

  const handleChange = (type) => {
    setView(type);
    localStorage.setItem(STORAGE_KEY, type);
  };

  return (
    <div className="flex justify-end mb-4 gap-2">
      <button
        onClick={() => handleChange('card')}
        className={`p-2 rounded ${view === 'card' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
      >
        <LayoutGrid className="w-5 h-5" />
      </button>
      <button
        onClick={() => handleChange('table')}
        className={`p-2 rounded ${view === 'table' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
      >
        <ListChecks className="w-5 h-5" />
      </button>
    </div>
  );
}
