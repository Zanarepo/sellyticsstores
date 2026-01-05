// src/components/Restock/RestockHeader.jsx
import React from "react";

export default function RestockHeader({ storeName }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400 truncate">
        Restocking Recommendations — {storeName || "Store"}
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Review predicted demand, current stock, and suggested actions to maintain inventory levels.
      </p>
    </div>
  );
}
