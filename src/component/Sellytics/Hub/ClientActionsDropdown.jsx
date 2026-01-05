// components/ClientActionsDropdown.jsx
import React, { useState } from "react";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";

export default function ClientActionsDropdown({ client, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-slate-100 transition"
      >
        <MoreVertical className="w-5 h-5 text-slate-600" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20">
            <button
              onClick={() => {
                onEdit(client);
                setOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
            >
              <Edit2 className="w-4 h-4" />
              Edit Client
            </button>
            <button
              onClick={() => {
                if (console.confirm("Delete this client? This cannot be undone.")) {
                  onDelete(client.id);
                }
                setOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left hover:bg-rose-50 flex items-center gap-2 text-rose-600"
            >
              <Trash2 className="w-4 h-4" />
              Delete Client
            </button>
          </div>
        </>
      )}
    </div>
  );
}