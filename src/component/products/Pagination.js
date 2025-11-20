export default function Pagination({ page, total, onChange }) {
  return (
    <div className="flex justify-center gap-2 mt-4">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
      >
        Prev
      </button>
      <span className="px-3 py-1">{page} / {total || 1}</span>
      <button
        disabled={page === total}
        onClick={() => onChange(page + 1)}
        className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}