import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PAGINATION } from './returnsConstants';

export default function ReturnsPagination({ 
  page, 
  pageSize, 
  totalCount, 
  onPageChange, 
  onPageSizeChange 
}) {
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  if (totalCount === 0) return null;

  return (
    <div className="flex items-center justify-between py-4 border-t border-slate-200">
      {/* Info */}
      <div className="flex items-center gap-4">
        <p className="text-sm text-slate-600">
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{totalCount}</span> results
        </p>

        {/* Page Size Selector */}
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          {PAGINATION.PAGE_SIZE_OPTIONS.map(size => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </select>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="px-4 py-2 text-sm font-medium text-slate-700">
          Page {page} of {totalPages}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}