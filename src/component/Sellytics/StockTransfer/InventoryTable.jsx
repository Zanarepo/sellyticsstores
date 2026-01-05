import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaEye,
  FaEyeSlash,
  FaExchangeAlt,
  //FaEllipsisV,
} from "react-icons/fa";

export default function InventoryTable({
  inventory,
  loading,
  show,
  toggleShow,
  onTransfer,
}) {
  const [openMenu, setOpenMenu] = useState(null);

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Inventory</h3>

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

      {/* Content */}
      {show && (
        <>
          {loading && (
            <p className="text-center text-gray-500 py-6">Loading...</p>
          )}

          {!loading && inventory.length === 0 && (
            <p className="text-center text-gray-500 py-6">No products</p>
          )}

          {/* ONE CARD PER ROW */}
          <div className="flex flex-col gap-3">
            {inventory.map((row, index) => (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="
                  relative w-full
                  bg-white dark:bg-slate-800
                  rounded-xl border border-slate-200 dark:border-slate-700
                  p-4 transition-shadow hover:shadow-md
                "
              >
                {/* Menu (UI only – no delete logic) */}
                <div className="absolute top-3 right-3">
                 
                  {openMenu === row.id && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpenMenu(null)}
                      />

                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="
                          absolute right-0 mt-2 w-40 z-50
                          bg-white dark:bg-slate-800
                          rounded-xl shadow-xl
                          border border-slate-200 dark:border-slate-700
                          overflow-hidden
                        "
                      >
                        <div className="px-4 py-2 text-xs text-slate-500">
                          No actions
                        </div>
                      </motion.div>
                    </>
                  )}
                </div>

                {/* Card Content */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Quantity */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-100 text-emerald-700 font-bold text-lg">
                    {row.available_qty}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                      {row.dynamic_product?.name ??
                        `Product #${row.dynamic_product_id}`}
                    </h4>

                    <p className="text-xs text-slate-500 mt-1">
                      Available Quantity
                    </p>
                  </div>

                  {/* Action */}
                  <div className="sm:ml-auto">
                    <button
                      onClick={() => onTransfer(row)}
                      className="
                        w-full sm:w-auto
                        bg-indigo-600 text-white
                        px-4 py-2 rounded-lg
                        hover:bg-indigo-700
                        flex items-center justify-center gap-2
                      "
                    >
                      <FaExchangeAlt />
                      Transfer
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
