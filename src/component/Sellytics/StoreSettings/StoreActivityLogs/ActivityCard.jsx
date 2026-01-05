// components/activity/ActivityCard.jsx
import React from 'react';
import { Package, Receipt } from 'lucide-react';
import ActionMenu from './ActionMenu';

const formatDate = (date) => new Date(date).toLocaleString();
const formatActivity = (type) => {
  const map = { insert: 'Created', update: 'Updated', delete: 'Deleted', sale: 'Sold' };
  return map[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

export default function ActivityCard({ log, onView, onDelete, canDelete }) {
  return (
    <div
      onClick={() => onView(log)}
      className="w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            log.source === 'product' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-indigo-100 dark:bg-indigo-900/30'
          }`}>
            {log.source === 'product' ? (
              <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            ) : (
              <Receipt className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                log.source === 'product' 
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' 
                  : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
              }`}>
                {log.source === 'product' ? 'Product' : 'Sale'}
              </span>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {formatActivity(log.activity_type)}
              </span>
            </div>

            <h3 className="font-semibold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {log.dynamic_product?.name || 'Unknown Item'}
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {formatDate(log.created_at)}
            </p>
          </div>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <ActionMenu
            onView={() => onView(log)}
            onDelete={() => onDelete(log.id, log.source)}
            canDelete={canDelete}
          />
        </div>
      </div>
    </div>
  );
}