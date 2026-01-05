import React, { useState } from "react";
import { motion } from "framer-motion";
import { MoreVertical, Calendar, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

function ActionsMenu({ onDelete }) {
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this forecast?")) {
      onDelete();
      toast.success("Forecast deleted");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors absolute top-2 right-2 sm:static"
      >
        <MoreVertical className="w-5 h-5 text-slate-500 dark:text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                handleDelete();
              }}
              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
}

export default function RestockTable({ forecasts, onDelete }) {
  return (
    <div className="space-y-4">
      {forecasts.map((f, i) => {
        const forecastDate = new Date(f.forecast_period).toLocaleDateString();

        const badgeClasses =
          f.recommendation === "Restock recommended"
            ? "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300 rounded-full px-2 py-1 inline-block"
            : "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300 rounded-full px-2 py-1 inline-block";

        return (
          <motion.div
            key={`${f.dynamic_product_id}-${f.store_id}-${f.forecast_period}-${i}`}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              {/* Left */}
              <div className="flex flex-col sm:flex-row items-start gap-4 flex-1 min-w-0 pr-12 sm:pr-0">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>

                <div className="min-w-0">
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white truncate">
                    {f.product_name || "Unknown product"}
                  </h3>

                  <div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Predicted Demand:
                      </span>
                      <span>{f.predicted_demand} units</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Current Stock:
                      </span>
                      <span>{f.current_stock} units</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Forecast Period:
                      </span>
                      <span>{forecastDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Recommendation:
                      </span>
                      <span className={badgeClasses}>{f.recommendation}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="hidden sm:flex items-center gap-4">
                <ActionsMenu onDelete={() => onDelete?.(f)} />
              </div>
            </div>

            {/* Mobile MoreVertical */}
            <div className="absolute top-2 right-2 sm:hidden">
              <ActionsMenu onDelete={() => onDelete?.(f)} />
            </div>

           
          </motion.div>
        );
      })}
    </div>
  );
}
