// src/components/PresetButtons.jsx
import React from "react";
import { Calendar } from "lucide-react";

export default function PresetButtons({ applyPreset }) {
  const presets = [
    { label: "Today", key: "today" },
    { label: "Last 7 Days", key: "7days" },
    { label: "This Week", key: "week" },
    { label: "This Month", key: "month" },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Date Filters</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {presets.map(({ label, key }) => (
          <button
            key={key}
            onClick={() => applyPreset(key)}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 
                       text-white font-medium rounded-lg shadow-sm hover:shadow-md 
                       transition-all active:scale-95 text-sm"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}