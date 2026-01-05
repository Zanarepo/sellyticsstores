import { useState, useMemo } from 'react';

export function usePagination(items, itemsPerPage) {
  const [currentPage, setPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return items.slice(start, end);
  }, [items, currentPage, itemsPerPage]);

  return {
    currentItems,
    currentPage,
    totalPages,
    setPage,
  };
}