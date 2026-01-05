import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ActionMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-slate-500" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onEdit();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <Edit className="w-4 h-4" />
              Edit Access
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onDelete();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
}