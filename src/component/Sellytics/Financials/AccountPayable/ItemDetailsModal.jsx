// ItemDetailsModal.jsx
import React from 'react';
import { X } from 'lucide-react';

export default function ItemDetailsModal({ isOpen, onClose, selectedItem }) {
  if (!isOpen || !selectedItem) return null;

  // Safe fallback: if items is missing or not an array, show empty message
  const items = Array.isArray(selectedItem.items) ? selectedItem.items : [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Item Details: {selectedItem.product_name || 'N/A'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Item ID (IMEI/Serial No)</th>
                  <th className="px-4 py-2 text-left font-medium">Size</th>
                  <th className="px-4 py-2 text-right font-medium">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-center text-slate-500 dark:text-slate-400">
                      No item details available
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">{item.device_id || 'N/A'}</td>
                      <td className="px-4 py-3">{item.size || 'N/A'}</td>
                      <td className="px-4 py-3 text-right font-medium">{item.qty || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-5 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}