// AnomalyCard.jsx
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, MoreVertical, Trash2 } from 'lucide-react';

export default function AnomalyCard({ anomaly, onDelete }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const isHigh = anomaly.anomaly_type === 'High';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this anomaly?')) {
      onDelete(anomaly.id);
    }
    setShowDropdown(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow relative"
    >
      {/* Top row: Icon + Title + Menu */}
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon + Title */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isHigh
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
            }`}
          >
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-slate-800 dark:text-white truncate">
              {anomaly.dynamic_product?.name || 'Unknown Product'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">{anomaly.quantity}</span> units sold
            </p>
          </div>
        </div>

        {/* Right: MoreVertical Menu */}
        <div className="relative flex-shrink-0">
          <button
            ref={buttonRef}
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown((prev) => !prev);
            }}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>

          {showDropdown && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden"
            >
              <button
                onClick={handleDelete}
                className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Anomaly
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom row: Badge + Date */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
            isHigh
              ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
              : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
          }`}
        >
          {anomaly.anomaly_type} Anomaly
        </span>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          {new Date(anomaly.sold_at).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </div>
      </div>
    </motion.div>
  );
}