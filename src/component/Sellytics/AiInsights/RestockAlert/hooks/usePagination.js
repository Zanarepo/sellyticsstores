import { useState, useMemo } from "react";

export function usePagination(data, perPage = 10) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.length / perPage);

  const slice = useMemo(() => {
    const start = (page - 1) * perPage;
    return data.slice(start, start + perPage);
  }, [data, page, perPage]);

  const refresh = () => setPage(1);

  return { slice, page, setPage, totalPages, refresh };
}
