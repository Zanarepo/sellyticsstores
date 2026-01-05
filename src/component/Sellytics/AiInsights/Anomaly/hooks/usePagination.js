import { useMemo, useState, useCallback } from 'react';

export function usePagination(data, perPage = 10) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / perPage));

  // Slice the current page of data
  const slice = useMemo(() => {
    const start = (page - 1) * perPage;
    return data.slice(start, start + perPage);
  }, [data, page, perPage]);

  // Refresh: reset page if current page exceeds total pages
  const refresh = useCallback(() => {
    setPage(prev => Math.min(prev, totalPages));
  }, [totalPages]);

  return {
    page,
    setPage,
    totalPages,
    slice,
    refresh, // <-- new method
  };
}
