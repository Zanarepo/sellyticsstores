import React from 'react';

export default function CustomerDetailsModal({ customer, onClose, formatPrice }) {
  if (!customer) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-5 shadow-lg overflow-hidden">
        {/* Header */}
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1 truncate">
          {customer.customerName}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 truncate">
          Store: <span className="font-medium">{customer.storeName}</span>
        </p>
        <p className="text-sm mb-3">
          Total Outstanding:{' '}
          <span className="font-semibold text-red-600">
            {formatPrice(customer.totalOutstanding)}
          </span>
        </p>

        {/* Items List */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
          {customer.items.map((item, i) => (
            <div
              key={i}
              className="flex justify-between items-center border rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            >
              <div className="flex flex-col min-w-0">
                <p className="font-medium text-sm truncate">{item.product}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Qty: {item.qty}</p>
              </div>
              <p className="font-semibold text-sm ml-2">
                {formatPrice(item.owed)}
              </p>
            </div>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
