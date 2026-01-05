import React, { useState } from "react";
import { MoreVertical, Trash2 } from "lucide-react";

export default function EntryCard({ entry, onDelete }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 hover:bg-slate-100 transition relative">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-8">
          <p className="font-medium text-slate-900">
            {entry.warehouse_product_id?.product_name || "Unknown"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {new Date(entry.created_at).toLocaleDateString(undefined, {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="p-2 rounded-lg hover:bg-slate-200 transition"
          >
            <MoreVertical className="w-5 h-5 text-slate-600" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
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
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            entry.movement_type === "IN"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {entry.movement_type === "IN" ? "+" : "-"}
          {entry.quantity}
        </span>
      </div>

      {entry.notes && (
        <p className="text-sm text-slate-600 mt-3 italic">"{entry.notes}"</p>
      )}
    </div>
  );
}
