import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart2, ChevronRight } from 'lucide-react';

const SalesCard = forwardRef(({ trend, topProducts, onClick }, ref) => {
  const { month, total_quantity, monthly_growth } = trend;

  // Determine growth indicator
  const isPositive = monthly_growth >= 0;

  // Prepare top product display
  const topProductName = Object.keys(topProducts || {})[0];
  const topProductQty = topProducts?.[topProductName] || 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`
        relative p-4 bg-white dark:bg-slate-800 rounded-xl border
        transition-all duration-200 hover:shadow-lg cursor-pointer
        ${isPositive ? 'border-emerald-200 dark:border-emerald-700' : 'border-red-200 dark:border-red-800'}
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">{month}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Total Sales: {total_quantity}
          </p>
          {topProductName && (
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1">
              <BarChart2 className="w-3 h-3" />
              Top: {topProductName} ({topProductQty})
            </p>
          )}
        </div>
        <div className={`text-sm font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} flex items-center gap-1`}>
          <TrendingUp className="w-4 h-4" />
          {isPositive ? '⬆' : '⬇'} {Math.round(monthly_growth * 100)}%
        </div>
      </div>
      <ChevronRight className="absolute top-4 right-4 w-5 h-5 text-slate-400" />
    </motion.div>
  );
});

export default SalesCard;
