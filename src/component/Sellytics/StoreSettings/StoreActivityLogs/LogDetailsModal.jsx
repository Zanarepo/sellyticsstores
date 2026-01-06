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
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
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
      before: before[key],
      after: after[key],
      changed: JSON.stringify(before[key]) !== JSON.stringify(after[key]),
    }))
    .filter(item => item.changed || !data.before); // Include all for insert
};

const ValueRenderer = ({ value, label }) => {
  // Check if it's the IMEI/barcode field and the value is an array
  if (label === 'IMEI(s)' && Array.isArray(value)) {
    if (value.length === 0) {
      return <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 italic">No items</p>;
    }
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {value.map((item, index) => (
          <span key={index} className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md px-2 py-0.5 text-xs font-mono">
            {item}
          </span>
        ))}
      </div>
    );
  }

  // Default rendering for other values
  return <p className="mt-2 text-slate-700 dark:text-slate-300 break-words">{formatValue(value)}</p>;
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
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {log.dynamic_product?.name || 'Activity Details'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {new Date(log.created_at).toLocaleString()} • {log.source.toUpperCase()} LOG
            </p>
          </div>
          <button onClick={onClose} className="p-2 -mt-1 -mr-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {changes.length === 0 ? (
          <p className="text-center text-slate-500 py-12">No significant changes recorded</p>
        ) : (
          <div className="space-y-4">
            {changes.map(({ label, before, after }) => (
              <div key={label} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-0">
                <h4 className="font-semibold text-slate-800 dark:text-white mb-2">{label}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-slate-100 dark:bg-slate-800/60 p-3 rounded-xl">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Before</span>
                    <ValueRenderer value={before} label={label} />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800/60 p-3 rounded-xl border-l-4 border-green-400">
                    <span className="text-xs font-semibold text-green-500 dark:text-green-400 uppercase tracking-wider">After</span>
                    <ValueRenderer value={after} label={label} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-8 w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}