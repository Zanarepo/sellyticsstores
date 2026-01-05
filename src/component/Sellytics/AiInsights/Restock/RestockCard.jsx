// RestockCard.jsx
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package,  MoreVertical, Trash2 } from 'lucide-react';

export default function RestockCard({ forecast, onDelete }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const needsRestock = forecast.recommendation?.toLowerCase().includes('restock');

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        buttonRef.current && !buttonRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this forecast?')) {
      onDelete(forecast.id);
    }
    setShowDropdown(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow relative"
    >
      {/* Top row: Icon + Product Name + Menu */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            needsRestock 
              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
              : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
          }`}>
            <Package className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white truncate">
              {forecast.product_name || 'Unknown Product'}
            </h3>
          </div>
        </div>

        {/* MoreVertical Menu */}
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(prev => !prev);
            }}
            className="p-2 -mr-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>

          {showDropdown && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden"
            >
              <button
                onClick={handleDelete}
                className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Forecast
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom row: Badge + Details */}
      <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
            needsRestock
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
          }`}
        >
          {forecast.recommendation || 'No Recommendation'}
        </span>

        <div className="text-sm text-slate-600 dark:text-slate-300">
          <span className="font-medium">Demand:</span> {forecast.predicted_demand} units
        </div>

        <div className="text-sm text-slate-600 dark:text-slate-300">
          <span className="font-medium">Stock:</span> {forecast.current_stock} units
        </div>

        <div className="text-sm text-slate-500 dark:text-slate-400">
          {forecast.forecast_period}
        </div>
      </div>
    </motion.div>
  );
}