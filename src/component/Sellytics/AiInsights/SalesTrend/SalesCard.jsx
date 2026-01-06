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
        p-2.5 sm:p-3 bg-white dark:bg-slate-800 rounded-lg border
        transition-all duration-200 hover:shadow-md cursor-pointer
        flex items-center justify-between gap-2
        ${isPositive ? 'border-emerald-200/80 dark:border-emerald-700/60' : 'border-red-200/80 dark:border-red-800/60'}
      `}
    >
      <div className="flex-grow overflow-hidden">
        <h3 className="font-semibold text-slate-800 dark:text-white text-sm">{month}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Units Sold: {total_quantity}
        </p>
        {topProductName && (
          <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1 flex items-center gap-1.5">
            <BarChart2 className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">
              {topProductName} ({topProductQty})
            </span>
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className={`text-xs sm:text-sm font-bold ${isPositive ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{isPositive ? '▲' : '▼'}{Math.round(Math.abs(monthly_growth * 100))}%</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
      </div>
    </motion.div>
  );
});

export default SalesCard;
