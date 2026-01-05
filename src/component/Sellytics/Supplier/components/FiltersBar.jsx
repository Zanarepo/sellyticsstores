// components/suppliers/FiltersBar.jsx
import React from "react";

export default function FiltersBar({
  search,
  setSearch,
}) {
  return (
    <div className="flex items-center bg-white dark:bg-gray-900 p-3 rounded-xl shadow mb-4 gap-3">
      <input
        className="flex-1 p-3 rounded-xl border dark:bg-gray-800"
        placeholder="Search supplier..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}
