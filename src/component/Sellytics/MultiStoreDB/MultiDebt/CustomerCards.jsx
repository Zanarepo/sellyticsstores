import React from 'react';

export default function CustomerCards({ customers, onSelect, formatPrice }) {
  if (!customers.length) return null;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-3">Customers</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {customers.map((c, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(c)}
            className="text-left bg-white dark:bg-gray-800 border rounded-lg p-3 shadow-sm hover:ring-2 ring-indigo-500 transition"
          >
           <p className="font-semibold truncate">{c.customerName}</p>

<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
  Store: <span className="font-medium">{c.storeName}</span>
</p>

<p className="text-sm mt-1">
  Owes:{' '}
  <span className="font-semibold text-red-600">
    {formatPrice(c.totalOutstanding)}
  </span>
</p>

<p className="text-xs text-gray-400 mt-1">
  {c.items.length} item{c.items.length > 1 ? 's' : ''}
</p>

          </button>
        ))}
      </div>
    </div>
  );
}
