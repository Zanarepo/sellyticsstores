/**
 * Sales Stats Cards Component
 */
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Package, BarChart3, Activity } from 'lucide-react';

export default function StatsCards({ trends, selectedMonthData, projections }) {
  const lastTrend = trends[trends.length - 1];
  const totalQty = trends.reduce((sum, t) => sum + (t.total_quantity || 0), 0);
  const avgGrowth = trends.length > 0
    ? (trends.reduce((sum, t) => sum + (t.monthly_growth || 0), 0) / trends.length) * 100
    : 0;

  const cards = [
    {
      title: 'Total Sales',
      value: totalQty.toLocaleString(),
      icon: BarChart3,
      color: 'indigo',
      subtitle: 'All time units',
    },
    {
      title: 'Last Month',
      value: lastTrend?.total_quantity?.toLocaleString() || '0',
      icon: Activity,
      color: 'blue',
      subtitle: lastTrend?.month || 'N/A',
    },
    {
      title: 'Avg Growth',
      value: `${avgGrowth.toFixed(1)}%`,
      icon: avgGrowth >= 0 ? TrendingUp : TrendingDown,
      color: avgGrowth >= 0 ? 'emerald' : 'red',
      subtitle: 'Monthly average',
    },
    {
      title: 'Top Product',
      value: selectedMonthData.topProduct?.name || 'N/A',
      icon: Package,
      color: 'purple',
      subtitle: `${selectedMonthData.topProduct?.quantity || 0} units`,
      truncate: true,
    },
  ];

  if (projections) {
    cards.push({
      title: 'Projected Next',
      value: projections.nextMonth.toLocaleString(),
      icon: projections.trend === 'up' ? TrendingUp : projections.trend === 'down' ? TrendingDown : Activity,
      color: projections.trend === 'up' ? 'emerald' : projections.trend === 'down' ? 'amber' : 'slate',
      subtitle: `${projections.avgGrowth.toFixed(1)}% avg growth`,
    });
  }

  const colorMap = {
    indigo: {
      bg: 'bg-indigo-100 dark:bg-indigo-900/30',
      text: 'text-indigo-600 dark:text-indigo-400',
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
    },
    emerald: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-600 dark:text-red-400',
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-400',
    },
    amber: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-600 dark:text-amber-400',
    },
    slate: {
      bg: 'bg-slate-100 dark:bg-slate-700',
      text: 'text-slate-600 dark:text-slate-300',
    },
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
      {cards.map((card, idx) => {
        const cardColor = colorMap[card.color] || colorMap.slate;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-2.5 sm:p-4 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-start gap-2 sm:gap-3 flex-col sm:flex-row">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${cardColor.bg} flex items-center justify-center flex-shrink-0`}>
                <card.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${cardColor.text}`} />
              </div>
              <div className="min-w-0 overflow-hidden">
                <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight">
                  {card.title}
                </p>
                <p className={`text-sm sm:text-base font-bold text-slate-800 dark:text-white ${card.truncate ? 'truncate' : ''}`}>
                  {card.value}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                  {card.subtitle}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}