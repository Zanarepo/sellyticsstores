// components/suppliers/EmptyState.jsx
import React from "react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center py-20 text-gray-500">
      <div className="text-6xl mb-4">📦</div>
      <h3 className="text-lg font-semibold">No suppliers found</h3>
      <p className="text-sm text-gray-400">Add your first supplier to get started</p>
    </div>
  );
}
