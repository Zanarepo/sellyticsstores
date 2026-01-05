// src/components/Anomalies/AnomalyLegend.jsx
import React, { useState } from 'react';

export default function AnomalyLegend() {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(v => !v)}
        className="px-3 py-1 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
      >
        {open ? 'Hide explanations' : 'Show explanations'}
      </button>

      {open && (
        <div className="mt-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
            How anomalies are detected
          </h3>

          <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
            <span className="font-medium text-red-600 dark:text-red-400">
              High anomaly:
            </span>{' '}
            Sales volume significantly above historical patterns. Could indicate
            bulk orders, promotions, fraud, or data errors.
          </p>

          <p className="text-xs text-gray-600 dark:text-gray-300">
            <span className="font-medium text-indigo-600 dark:text-indigo-400">
              Low anomaly:
            </span>{' '}
            Sales volume far below expectations. Often caused by stockouts,
            demand drops, or reporting issues.
          </p>
        </div>
      )}
    </div>
  );
}
