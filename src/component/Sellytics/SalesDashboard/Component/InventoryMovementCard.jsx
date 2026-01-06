// src/components/SalesDashboard/Component/InventoryMovementCard.jsx
import React from "react";
import { motion } from "framer-motion";
import { Package, TrendingUp, TrendingDown } from "lucide-react";

export default function InventoryMovementCard({ restockMetrics, loading }) {
  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700 animate-pulse"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div>
                  <div className="h-3 sm:h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-20 sm:w-28 mb-1" />
                  <div className="h-5 sm:h-7 bg-gray-200 dark:bg-gray-700 rounded w-12 sm:w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!restockMetrics) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center text-slate-500">
        <Package className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1 sm:mb-2 opacity-50" />
        <p className="text-sm sm:text-base">No restock data available yet.</p>
      </div>
    );
  }

  const {
    avgRestockPerProduct = 0,
    mostRestocked = null,
    leastRestocked = null,
  } = restockMetrics;

  const avg = Number(avgRestockPerProduct).toFixed(1);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      {/* Grid: 1 col mobile, 3 col md+ */}
       <h3 className="text-xl sm:text-2xl font-bold text-indigo-700 dark:text-indigo-400 text-center mb-3 sm:mb-4">
          Inventory Restock Insights
        </h3>
  
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Average Restock Size */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Avg Restock Size</p>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0">
                {avg}
              </p>
              <p className="text-2xs sm:text-xs text-blue-600 dark:text-blue-400 mt-0">
                units per restock
              </p>
            </div>
          </div>
        </motion.div>

        {/* Most Restocked Product */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-tight">Most Restocked</p>
              <div className="flex items-baseline justify-between mt-0.5">
                <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate max-w-[70%]">
                  {mostRestocked?.productName || "N/A"}
                </p>
                <p className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                  {mostRestocked?.quantity?.toLocaleString() || 0}
                  <span className="text-2xs sm:text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">units</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Least Restocked Product */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-tight">Rarely Restocked</p>
              <div className="flex items-baseline justify-between mt-0.5">
                <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate max-w-[70%]">
                  {leastRestocked?.productName || "N/A"}
                </p>
                <p className="text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400 flex-shrink-0">
                  {leastRestocked?.quantity?.toLocaleString() || 0}
                  <span className="text-2xs sm:text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">units</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Note */}
      <div className="mt-3 text-center text-2xs sm:text-xs text-slate-500 dark:text-slate-400">
        Based on all restock events in the selected period
      </div>
    </div>
  );
}