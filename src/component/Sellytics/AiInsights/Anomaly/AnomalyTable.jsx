// src/components/Sellytics/AiInsights/Anomaly/AnomalyTable.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Calendar, Trash2 } from 'lucide-react';

function ActionsMenu({ onDelete }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(v => !v);
        }}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-slate-500 dark:text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onDelete();
              }}
              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
}

export default function AnomalyTable({ anomalies, onDelete }) {
  return (
    <div className="space-y-4">
      {anomalies.map((a, i) => {
        const soldDate = new Date(a.sold_at).toLocaleDateString();

        return (
          <motion.div
            key={a.id || i}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow cursor-pointer"
          >
            {/* Mobile Actions: top-right */}
            <div className="absolute top-4 right-4 sm:hidden">
              <ActionsMenu onDelete={() => onDelete?.(a)} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              {/* Left */}
              <div className="flex flex-col sm:flex-row items-start gap-4 flex-1 min-w-0 pr-12 sm:pr-0">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>

                <div className="min-w-0">
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white truncate">
                    {a.dynamic_product?.name || 'Unknown product'}
                  </h3>

                  <div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Quantity:</span>
                      <span>{a.quantity} units</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Date:</span>
                      <span>{soldDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                      <span className={a.anomaly_type === 'High'
                        ? 'text-red-600 dark:text-red-400 font-medium'
                        : 'text-indigo-600 dark:text-indigo-400 font-medium'}>
                        {a.anomaly_type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right (desktop only) */}
              <div className="hidden sm:flex items-center gap-4">
                <ActionsMenu onDelete={() => onDelete?.(a)} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
