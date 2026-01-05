/**
 * SwiftInventory - usePagination Hook
 * Handles pagination of inventory list
 */
import { useState, useMemo } from 'react';

export default function usePagination(items, itemsPerPage = 20) {
  const [page, setPage] = useState(1);

  const totalPages = useMemo(() => {
    return Math.ceil((items?.length || 0) / itemsPerPage);
  }, [items, itemsPerPage]);

  const paginatedItems = useMemo(() => {
    if (!items?.length) return [];
    const start = (page - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, page, itemsPerPage]);

  const nextPage = () => {
    if (page < totalPages) setPage(p => p + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage(p => p - 1);
  };

  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setPage(pageNum);
    }
  };

  // Reset to page 1 when items change significantly
  const resetPage = () => setPage(1);

  return {
    page,
    totalPages,
    paginatedItems,
    nextPage,
    prevPage,
    goToPage,
    resetPage,
    itemsPerPage
  };
}