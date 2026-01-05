// AccountsPayable.jsx
import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Loader2, Search } from 'lucide-react';
import usePayableEntries from './usePayableEntries';
import { useCurrency } from '../../../context/currencyContext'; // Your real currency hook
import PayableCard from './PayableCard';
import ItemDetailsModal from './ItemDetailsModal';

export default function AccountsPayable() {
  const storeId = localStorage.getItem('store_id');
  const { formatPrice } = useCurrency(); // Reads preferred currency from localStorage
  const { filteredAp, isLoading, searchTerm, setSearchTerm, statusFilter, setStatusFilter, updatePaymentStatus } = usePayableEntries(storeId);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const entriesPerPage = 12;

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentEntries = filteredAp.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredAp.length / entriesPerPage);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  // Totals
  const totals = filteredAp.reduce(
    (acc, entry) => ({
      totalOwed: acc.totalOwed + (entry.amount || 0),
      totalUnpaid: acc.totalUnpaid + (entry.status === 'Pending' ? entry.amount || 0 : 0),
    }),
    { totalOwed: 0, totalUnpaid: 0 }
  );

  if (!storeId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <p className="text-red-600 dark:text-red-400 text-lg font-semibold">
          No store selected. Please choose a store.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Accounts Payable
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Track and manage money you owe to suppliers
        </p>
      </div>

      {/* Info Banner */}
      <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-xl text-center text-sm sm:text-base">
        Add details to your products for better tracking of your bills!
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Paid">Paid</option>
            <option value="Part Paid">Part Paid</option>
          </select>
        </div>

        {/* Clear Filters */}
        <button
          onClick={clearFilters}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 dark:bg-slate-700 text-white dark:text-slate-300 rounded-xl hover:bg-indigo-800 dark:hover:bg-slate-600 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* Totals */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Owed</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatPrice(totals.totalOwed)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Unpaid</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatPrice(totals.totalUnpaid)}
          </p>
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin" />
        </div>
      ) : filteredAp.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          No bills found. Try adjusting filters.
        </div>
      ) : (
        <div className="space-y-4">
          {currentEntries.map((entry) => (
            <PayableCard
              key={entry.id}
              entry={entry}
              onUpdateStatus={updatePaymentStatus}
            
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Showing {indexOfFirst + 1}–{Math.min(indexOfLast, filteredAp.length)} of {filteredAp.length}
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-50"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <ItemDetailsModal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          selectedItem={selectedItem}
        />
      )}
    </div>
  );
}