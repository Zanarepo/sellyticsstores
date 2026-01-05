// src/components/stockTransfer/TransferHistoryTable.jsx
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function TransferHistoryTable({
  entries,
  totalPages,
  currentPage,
  paginate,
  loading,
  show,
  toggleShow,
  onViewDetails,
}) {
  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Transfer History
        </h3>

        <button
          onClick={toggleShow}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          {show ? <FaEyeSlash /> : <FaEye />}
          <span className="hidden sm:inline">
            {show ? "Hide" : "Show"}
          </span>
        </button>
      </div>

      {show && (
        <>
          {/* States */}
          {loading && (
            <p className="text-center text-slate-500 py-6">Loading...</p>
          )}

          {!loading && entries.length === 0 && (
            <p className="text-center text-slate-500 py-6">
              No transfer history
            </p>
          )}

          {/* Cards */}
          <div className="flex flex-col gap-3">
            {entries.map((t, index) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="
                  bg-white dark:bg-slate-800
                  border border-slate-200 dark:border-slate-700
                  rounded-xl p-4
                  transition-shadow hover:shadow-md
                "
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Left */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500">From:</span>
                      <span className="font-medium truncate">
                        {t.source_store?.shop_name || "—"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm mt-1">
                      <span className="text-slate-500">To:</span>
                      <span className="font-medium truncate">
                        {t.destination_store?.shop_name || "—"}
                      </span>
                    </div>

                    <button
                      onClick={() => onViewDetails(t)}
                      className="
                        mt-2 inline-flex
                        text-indigo-600 hover:underline
                        font-semibold text-sm
                      "
                    >
                      {t.product?.name}
                    </button>
                  </div>

                  {/* Meta */}
                  <div className="sm:text-right text-xs text-slate-500">
                    <div>
                      {new Date(t.requested_at).toLocaleDateString()}
                    </div>
                    <div className="mt-1 font-semibold uppercase text-indigo-600">
                      {t.status}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
              <div className="text-sm text-slate-500">
                Page {currentPage} of {totalPages}
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="
                    px-4 py-2 rounded-lg
                    bg-slate-100 dark:bg-slate-700
                    hover:bg-slate-200 dark:hover:bg-slate-600
                    disabled:opacity-40 disabled:cursor-not-allowed
                  "
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`
                        px-4 py-2 rounded-lg font-medium
                        ${
                          currentPage === page
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                        }
                      `}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="
                    px-4 py-2 rounded-lg
                    bg-slate-100 dark:bg-slate-700
                    hover:bg-slate-200 dark:hover:bg-slate-600
                    disabled:opacity-40 disabled:cursor-not-allowed
                  "
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
