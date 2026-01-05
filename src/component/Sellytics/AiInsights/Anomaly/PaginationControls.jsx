// src/components/Anomalies/PaginationControls.jsx
export default function PaginationControls({
  page,
  totalPages,
  onChange,
}) {
  if (!totalPages || totalPages <= 1) return null;

  const goPrev = () => {
    if (page > 1) onChange(page - 1);
  };

  const goNext = () => {
    if (page < totalPages) onChange(page + 1);
  };

  return (
    <div className="flex items-center justify-between mt-4 text-xs">
      <span className="text-gray-500">
        Page {page} of {totalPages}
      </span>

      <div className="flex gap-2">
        <button
          onClick={goPrev}
          disabled={page === 1}
          className={`px-3 py-1 rounded border
            ${page === 1
              ? 'text-gray-400 border-gray-200 cursor-not-allowed'
              : 'text-indigo-600 border-indigo-300 hover:bg-indigo-50'
            }`}
        >
          Previous
        </button>

        <button
          onClick={goNext}
          disabled={page === totalPages}
          className={`px-3 py-1 rounded border
            ${page === totalPages
              ? 'text-gray-400 border-gray-200 cursor-not-allowed'
              : 'text-indigo-600 border-indigo-300 hover:bg-indigo-50'
            }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
