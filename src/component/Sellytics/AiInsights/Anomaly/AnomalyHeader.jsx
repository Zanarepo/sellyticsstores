// src/components/Anomalies/AnomalyHeader.jsx
import React from 'react';

export default function AnomalyHeader({ storeName }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
        Sales Anomalies
      </h2>
      <p className="text-xs text-gray-600 dark:text-gray-400">
        Monitoring unusual sales behavior for <span className="font-medium">{storeName}</span>
      </p>
    </div>
  );
}
