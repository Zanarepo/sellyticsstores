// src/components/SalesDashboard/Component/InventoryMovementCard.jsx
import React from "react";
import { motion } from "framer-motion";
import { Package, TrendingUp, TrendingDown } from "lucide-react";

export default function InventoryMovementCard({ restockMetrics, loading }) {
  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
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
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 text-center text-slate-500">
        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No restock data available yet.</p>
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
       <h3 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 text-center mb-8">
          Inventory Restock Insights
        </h3>
  
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Average Restock Size */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Avg Restock Size</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {avg}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
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
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-500 dark:text-slate-400">Most Restocked</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white truncate mt-1">
                {mostRestocked?.productName || "N/A"}
              </p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {mostRestocked?.quantity?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                units total
              </p>
            </div>
          </div>
        </motion.div>

        {/* Least Restocked Product */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-500 dark:text-slate-400">Rarely Restocked</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white truncate mt-1">
                {leastRestocked?.productName || "N/A"}
              </p>
              <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {leastRestocked?.quantity?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-rose-600 dark:text-rose-400">
                units total
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Note */}
      <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Based on all restock events in the selected period
      </div>
    </div>
  );
}