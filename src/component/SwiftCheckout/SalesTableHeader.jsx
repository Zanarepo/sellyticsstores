/**
 * SwiftCheckout - Sales Table Header Component
 */
import React from 'react';
import 'react-toastify/dist/ReactToastify.css';

export default function SalesTableHeader({ isMultiStoreOwner, isMobile }) {
  if (isMobile) {
    return null;
  }

  return (
    <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0">
      <tr>
        {isMultiStoreOwner && (
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            Store
          </th>
        )}
        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
          Product
        </th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider hidden sm:table-cell">
          Customer
        </th>
        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
          Qty
        </th>
        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
          Amount
        </th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider hidden md:table-cell">
          Payment
        </th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider hidden lg:table-cell">
          Date
        </th>
        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider w-12">
          
        </th>
      </tr>
    </thead>
  );
}