// components/SupplierRow.jsx
import React from "react";

export default function SupplierRow({ item, onMore, highlightIdMatch }) {
  const isHighlighted = highlightIdMatch(item.device_id);

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
      <td className="px-4 py-3 text-sm">{item.supplier_name || "None"}</td>

      <td className="px-4 py-3 text-sm">{item.device_name}</td>

      <td
        className={`px-4 py-3 text-sm ${
          isHighlighted ? "bg-yellow-100 dark:bg-yellow-900" : ""
        }`}
      >
        {item.device_id}
      </td>

      <td className="px-4 py-3 text-sm">{item.qty}</td>

      <td className="px-4 py-3 text-sm">
        {new Date(item.created_at).toLocaleDateString()}
      </td>

      {/* More Button */}
      <td className="px-4 py-3 text-sm text-right">
        <button
          onClick={() => onMore(item)}
          className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          More
        </button>
      </td>
    </tr>
  );
}
