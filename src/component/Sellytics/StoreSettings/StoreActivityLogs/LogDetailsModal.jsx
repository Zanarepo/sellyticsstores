// components/activity/LogDetailsModal.jsx
import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const formatLabel = (key) => {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/Id$/, 'ID')
    .replace(/Imeis$/, 'IMEI(s)');
};

const formatValue = (value) => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
    return new Date(value).toLocaleString();
  }
  return String(value);
};

const getChanges = (details) => {
  if (!details) return [];

  let data = typeof details === 'string' ? JSON.parse(details) : details;
  const before = data.before || {};
  const after = data.after || data;

  const excluded = new Set(['id', 'store_id', 'created_at', 'updated_at', 'created_by_user_id', 'dynamic_product_id', 'sale_group_id', 'customer_id',
    'created_by_owner','created_by_stores','created_by_owner_id', 'syncerror', 'notes'
  ]);

  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return Array.from(keys)
    .filter(k => !excluded.has(k.toLowerCase()))
    .map(key => ({
      key,
      label: formatLabel(key),
      before: formatValue(before[key]),
      after: formatValue(after[key]),
      changed: before[key] !== after[key]
    }))
    .filter(item => item.changed || !data.before); // Include all for insert
};

export default function LogDetailsModal({ log, onClose }) {
  if (!log) return null;

  const changes = getChanges(log.details);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8"
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              {log.dynamic_product?.name || 'Activity Details'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              {new Date(log.created_at).toLocaleString()} • {log.source.toUpperCase()} LOG
            </p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
            <X className="w-6 h-6" />
          </button>
        </div>

        {changes.length === 0 ? (
          <p className="text-center text-slate-500 py-12">No significant changes recorded</p>
        ) : (
          <div className="space-y-6">
            {changes.map(({ label, before, after }) => (
              <div key={label} className="border-b border-slate-200 dark:border-slate-700 pb-6 last:border-0">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3">{label}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
                    <span className="text-sm font-medium text-red-700 dark:text-red-400">Before</span>
                    <p className="mt-2 text-slate-700 dark:text-slate-300">{before}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">After</span>
                    <p className="mt-2 text-slate-700 dark:text-slate-300">{after}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-10 w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}