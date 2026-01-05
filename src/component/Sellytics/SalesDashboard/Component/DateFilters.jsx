// src/components/DateFilters.jsx
import React from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

export default function DateFilters({ startDate, endDate, setStartDate, setEndDate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="w-full bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
          <Calendar className="w-6 h-6 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Custom Date Range
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Select start and end dates to filter sales
          </p>
        </div>
      </div>

      {/* Date Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
          />
        </div>
      </div>
    </motion.div>
  );
}