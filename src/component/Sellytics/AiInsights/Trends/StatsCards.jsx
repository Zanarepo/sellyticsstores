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
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    slate: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {cards.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                {card.title}
              </p>
              <p className={`text-2xl font-bold text-slate-900 dark:text-white ${card.truncate ? 'truncate' : ''}`}>
                {card.value}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[card.color]}`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {card.subtitle}
          </p>
        </motion.div>
      ))}
    </div>
  );
}