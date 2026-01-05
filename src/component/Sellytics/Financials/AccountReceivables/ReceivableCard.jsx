// ReceivableCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Package} from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';

export default function ReceivableCard({ entry, onViewCustomer, onDelete }) {
  const { formatPrice } = useCurrency();
 

  const daysOverdue = Math.floor((new Date() - new Date(entry.date)) / (1000 * 60 * 60 * 24));


  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 hover:shadow-md transition-all relative cursor-pointer"
      onClick={() => onViewCustomer()} // Opens customer modal on card click
    >
      {/* Top row: Icon + Customer + Menu */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white truncate">
              {entry.customer_name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {new Date(entry.date).toLocaleDateString()} • {daysOverdue} days overdue
            </p>
          </div>
        </div>

        {/* MoreVertical Menu - Only Delete 
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click from opening modal
              setShowDropdown(prev => !prev);
            }}
            className="p-2 -mr-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>

          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden"
            >
              <button
                onClick={handleDelete} // Delete button now works cleanly
                className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Receivable
              </button>
            </motion.div>
          )}
        </div>*/}
      </div>

      {/* Bottom row: Product + Amounts */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-slate-500 dark:text-slate-400">Product</p>
          <p className="font-medium text-slate-900 dark:text-white truncate">
            {entry.product_name || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">Owed</p>
          <p className="font-semibold text-slate-900 dark:text-white">
            {formatPrice(entry.owed)}
          </p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">Remaining</p>
          <p className="font-semibold text-red-600 dark:text-red-400">
            {formatPrice(entry.remaining_balance)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}