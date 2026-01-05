// hooks/useSuppliersPagination.js
import { useState } from "react";

export default function useSuppliersPagination(defaultLimit = 10) {
  const [page, setPage] = useState(1);
  const limit = defaultLimit;

  const nextPage = (totalCount) => {
    if (page * limit < totalCount) setPage(page + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const goToPage = (p, totalCount) => {
    if (p < 1 || p > Math.ceil(totalCount / limit)) return;
    setPage(p);
  };

  return { page, limit, setPage, nextPage, prevPage, goToPage };
}
