// src/components/PresetButtons.jsx
import React from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

export default function PresetButtons({ applyPreset }) {
  const presets = [
    { label: "Today", key: "today" },
    { label: "Last 7 Days", key: "7days" },
    { label: "This Week", key: "week" },
    { label: "This Month", key: "month" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="w-full bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
          <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Quick Date Filters
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tap a preset to filter sales instantly
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-3">
        {presets.map(({ label, key }) => (
          <button
            key={key}
            onClick={() => applyPreset(key)}
            className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 
                       text-white font-medium rounded-xl shadow-md hover:shadow-lg 
                       transition-all duration-300 active:scale-95 whitespace-nowrap"
          >
            {label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}