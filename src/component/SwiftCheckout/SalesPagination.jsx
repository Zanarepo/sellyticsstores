/**
 * SwiftCheckout - Sales Pagination Component
 */
import React from 'react';

import 'react-toastify/dist/ReactToastify.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function SalesPagination({
  currentPage,
  setCurrentPage,
  totalItems,
  itemsPerPage,
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      {/* Info */}
      <div className="text-sm text-slate-500 dark:text-slate-400">
        Showing <span className="font-medium text-slate-900 dark:text-white">{startItem}</span> to{' '}
        <span className="font-medium text-slate-900 dark:text-white">{endItem}</span> of{' '}
        <span className="font-medium text-slate-900 dark:text-white">{totalItems}</span> results
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="h-9 w-9 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((page, idx) => (
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">...</span>
          ) : (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`h-9 w-9 flex items-center justify-center rounded-lg font-medium transition-colors ${
                currentPage === page 
                  ? 'bg-indigo-600 text-white' 
                  : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {page}
            </button>
          )
        ))}

        <button
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="h-9 w-9 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}