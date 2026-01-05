import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Edit2, Trash2 } from "lucide-react";

export default function RowMenu({ canEdit = false, canDelete = false, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!canEdit && !canDelete) return null;

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300"
        aria-label="Row actions"
      >
        <MoreHorizontal className="w-4 h-4 text-slate-600" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
          {canEdit && (
            <button
              onClick={() => {
                setOpen(false);
                onEdit?.();
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-50 focus:outline-none"
            >
              <Edit2 className="w-4 h-4" /> Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => {
                setOpen(false);
                onDelete?.();
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 focus:outline-none"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
