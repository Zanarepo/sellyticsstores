// components/suppliers/PaginationControls.jsx
import React from "react";

export default function PaginationControls({
  page,
  totalPages,
  setPage,
}) {
  return (
    <div className="flex justify-center gap-3 pt-6">
      <button
        onClick={() => page > 1 && setPage(page - 1)}
        className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700"
      >
        Prev
      </button>

      <div className="px-4 py-2 font-medium">
        {page} / {totalPages}
      </div>

      <button
        onClick={() => page < totalPages && setPage(page + 1)}
        className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700"
      >
        Next
      </button>
    </div>
  );
}
