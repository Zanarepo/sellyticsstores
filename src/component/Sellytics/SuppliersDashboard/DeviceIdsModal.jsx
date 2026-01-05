// src/components/Suppliers/DeviceIdsModal.jsx
import React from 'react';

export default function DeviceIdsModal({ item, open, onClose, search }) {
  if (!open || !item) return null;

  const ids = item.device_id?.split(',').map(id => id.trim()).filter(Boolean) || [];
  const highlighted = search?.trim().toLowerCase();

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6">
          {item.device_name} - Device IDs ({ids.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ids.map((id, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg font-mono text-sm break-all ${
                highlighted && id.toLowerCase().includes(highlighted)
                  ? 'bg-yellow-100 dark:bg-yellow-900'
                  : 'bg-slate-100 dark:bg-slate-700'
              }`}
            >
              {id}
            </div>
          ))}
        </div>

        <div className="mt-8 text-right">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}