/**
 * Theft Incident Card Component - One per row
 */
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Trash2, Calendar, Package } from 'lucide-react';

export default function TheftCard({ 
  incident, 
  isSelected, 
  onToggleSelect, 
  onDelete 
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
      className={`bg-white dark:bg-slate-800 rounded-xl border-2 transition-all ${
        isSelected 
          ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' 
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      {/* Full Width Layout - One per row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4">
        {/* Selection Checkbox */}
        <div className="flex-shrink-0 self-start sm:self-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(incident.id)}
            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
        </div>

        {/* Product Info - Icon + Name */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate text-base">
              {incident.product_name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-full font-bold">
                {Math.abs(incident.inventory_change)} missing
              </span>
            </div>
          </div>
        </div>

        {/* Metadata - Responsive */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-slate-500 sm:hidden">Detected: </span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                {new Date(incident.timestamp).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-slate-500">ID: </span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                {incident.dynamic_product_id}
              </span>
            </div>
          </div>
        </div>

        {/* Delete Button */}
        <div className="flex-shrink-0 self-end sm:self-center">
          <button
            onClick={() => onDelete(incident.id)}
            className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}