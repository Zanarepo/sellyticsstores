import React from "react";

export default function SupplierActionSheet({ open, onClose, onEdit, onDelete, item }) {
  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose}></div>

      {/* Sheet */}
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl shadow-lg p-4 animate-slide-up">
        <div className="text-center text-gray-800 dark:text-gray-200 font-semibold text-lg pb-2">
          {item.device_name}
        </div>

        <div className="border-t dark:border-gray-700 mt-2"></div>

        {/* Actions */}
        <div className="mt-3 flex flex-col gap-2">
          <button
            onClick={() => { onEdit(item); onClose(); }}
            className="w-full py-3 text-blue-600 dark:text-blue-400 text-center text-lg rounded-lg active:bg-gray-100 dark:active:bg-gray-800"
          >
            Edit
          </button>
          <button
            onClick={() => { onDelete(item.id, item.device_name); onClose(); }}
            className="w-full py-3 text-red-600 text-center text-lg rounded-lg font-semibold active:bg-gray-100 dark:active:bg-gray-800"
          >
            Delete
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-3 py-3 text-center bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl text-lg active:bg-gray-300 dark:active:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
