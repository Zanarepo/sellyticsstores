import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Trash2 } from "lucide-react";

export default function EntryRow({ entry, onDelete, isLastRow }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 relative">
      <td className="py-4 px-4 text-slate-500">
        {new Date(entry.created_at).toLocaleDateString()}
      </td>
      <td className="py-4 px-4 font-medium">
        {entry.warehouse_product_id?.product_name || "Unknown"}
      </td>
      <td className="py-4 px-4">
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
            entry.movement_type === "IN"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {entry.movement_type}
        </span>
      </td>
      <td className="py-4 px-4 text-right font-semibold">
        {entry.movement_type === "IN" ? "+" : "-"}
        {entry.quantity}
      </td>
      <td className="py-4 px-4 text-slate-500 text-sm">{entry.notes || "-"}</td>
      <td className="py-4 px-4 text-right relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="p-2 rounded-lg hover:bg-slate-100 transition"
        >
          <MoreVertical className="w-5 h-5 text-slate-600" />
        </button>

        {dropdownOpen && (
          <div
            className={`absolute right-0 w-40 bg-white rounded-lg shadow-lg border border-slate-200 z-10 ${
              isLastRow ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            <button
              onClick={() => {
                onDelete(entry.id);
                setDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
