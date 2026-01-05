export default function PaginationControls({ page, totalPages, onChange }) {
  return (
    <div className="flex justify-between items-center mt-4">
      <div className="text-sm text-gray-600 dark:text-gray-300">
        Page {page} of {totalPages}
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className={`px-2 py-0.5 rounded-lg text-xs ${
            page === 1
              ? "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-800 dark:hover:bg-indigo-700"
          }`}
        >
          Previous
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => onChange(i + 1)}
            className={`px-2 py-0.5 rounded-lg text-xs ${
              page === i + 1
                ? "bg-indigo-600 text-white dark:bg-indigo-800 dark:text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className={`px-2 py-0.5 rounded-lg text-xs ${
            page === totalPages
              ? "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-800 dark:hover:bg-indigo-700"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
