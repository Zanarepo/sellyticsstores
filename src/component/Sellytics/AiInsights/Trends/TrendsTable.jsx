/**
 * Trends List – Card-based (TheftCard-style)
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Package,
} from "lucide-react";

export default function TrendsList({ trends, rangeFilter, selectedMonth }) {
  if (!trends.length) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center text-slate-500 dark:text-slate-400">
        No data available for{" "}
        {rangeFilter === "single"
          ? new Date(selectedMonth + "-01").toLocaleString("default", {
              month: "long",
              year: "numeric",
            })
          : "the selected range"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {trends.map((trend, idx) => {
          const growth = trend.monthly_growth ?? 0;
          const growthPct = Math.round(growth * 100);

          const GrowthIcon =
            growth > 0 ? TrendingUp : growth < 0 ? TrendingDown : Minus;

          const growthStyles =
            growth > 0
              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
              : growth < 0
              ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
              : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400";

          return (
            <motion.div
              key={trend.month}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30">
                  <GrowthIcon className="w-6 h-6" />
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                    {new Date(trend.month + "-01").toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                    {/* Total Quantity */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                        {trend.total_quantity ?? 0}
                      </div>
                      <span className="text-xs text-slate-500">
                        total quantity
                      </span>
                    </div>

                    {/* Growth */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${growthStyles}`}
                      >
                        <GrowthIcon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          growth > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : growth < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {growth > 0 ? "+" : ""}
                        {growthPct}%
                      </span>
                    </div>
                  </div>

                  {/* Footer row */}
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      Top product:{" "}
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {trend.top_product || "No data"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Right meta */}
                <div className="flex-shrink-0 self-end sm:self-center flex items-center gap-2 text-xs text-slate-500">
                  <Package className="w-4 h-4" />
                  <span>Monthly Trend</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
