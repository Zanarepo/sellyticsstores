// src/components/Customers/CustomerList.jsx
import React from 'react';
import CustomerCard from './CustomerCard';

export default function CustomerList({ customers, loading, onEdit, onDelete, totalCount, page, setPage, pageSize }) {
  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading customers...</div>;
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p className="text-xl font-medium">No customers found</p>
        <p className="text-sm mt-2">Add your first customer to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {customers.map((customer) => (
        <CustomerCard
          key={customer.id}
          customer={customer}
          onEdit={() => onEdit(customer)}
          onDelete={() => onDelete(customer.id)}
        />
      ))}

      {/* Pagination */}
      {totalCount > pageSize && (
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-5 py-3 bg-slate-200 dark:bg-slate-700 rounded-xl disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-5 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
            Page {page + 1} of {Math.ceil(totalCount / pageSize)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={(page + 1) * pageSize >= totalCount}
            className="px-5 py-3 bg-slate-200 dark:bg-slate-700 rounded-xl disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}