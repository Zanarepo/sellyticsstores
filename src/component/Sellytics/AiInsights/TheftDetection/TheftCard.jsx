/**
 * Theft Incident Card Component - One per row
 */
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, MoreVertical, Trash2, Calendar, Package } from 'lucide-react';

export default function TheftCard({ 
  incident, 
  isSelected, 
  onToggleSelect, 
  onDelete 
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

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
    if (window.confirm('Are you sure you want to delete this theft incident?')) {
      onDelete(incident.id);
    }
    setShowDropdown(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
      className={`bg-white dark:bg-slate-800 rounded-xl border-2 transition-all relative ${
        isSelected 
          ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' 
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      <div className="p-4 sm:p-5 flex flex-col gap-4">
        {/* Top row: Checkbox + Icon + Product Name + Menu */}
        <div className="flex items-start justify-between gap-3">
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(incident.id)}
            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer flex-shrink-0 mt-0.5"
          />

          {/* Icon + Name */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                {incident.product_name}
              </h3>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs sm:text-sm rounded-full font-bold">
                  {Math.abs(incident.inventory_change)} missing
                </span>
              </div>
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
                transition={{ duration: 0.15 }}
                className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden"
              >
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Incident
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Bottom row: Metadata */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="font-medium">
              {new Date(incident.timestamp).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-400" />
            <span className="font-medium">
              ID: {incident.dynamic_product_id}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}