/**
 * Trends Insights Component
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

export default function TrendsInsights({ trends, projections, selectedMonth }) {
  const insights = [];

  // Current month growth insight
  const currentMonth = trends.find(t => t.month === selectedMonth);
  if (currentMonth) {
    const growth = currentMonth.monthly_growth * 100;
    if (growth > 10) {
      insights.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Strong Growth',
        message: `Excellent ${growth.toFixed(1)}% growth in ${new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long' })}`,
      });
    } else if (growth < -10) {
      insights.push({
        type: 'warning',
        icon: TrendingDown,
        title: 'Declining Sales',
        message: `Sales dropped ${Math.abs(growth).toFixed(1)}% in ${new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long' })}`,
      });
    }
  }

  // Projection insight
  if (projections) {
    insights.push({
      type: projections.trend === 'up' ? 'info' : projections.trend === 'down' ? 'warning' : 'neutral',
      icon: projections.trend === 'up' ? TrendingUp : projections.trend === 'down' ? TrendingDown : AlertCircle,
      title: 'Forecast',
      message: `Projected ${projections.nextMonth.toLocaleString()} units next month (${projections.avgGrowth.toFixed(1)}% trend)`,
    });
  }

  // Consistency insight
  const recentTrends = trends.slice(-3);
  const allPositive = recentTrends.every(t => t.monthly_growth > 0);
  const allNegative = recentTrends.every(t => t.monthly_growth < 0);

  if (allPositive) {
    insights.push({
      type: 'success',
      icon: TrendingUp,
      title: 'Consistent Growth',
      message: 'Three consecutive months of positive growth',
    });
  } else if (allNegative) {
    insights.push({
      type: 'error',
      icon: AlertCircle,
      title: 'Attention Needed',
      message: 'Three consecutive months of declining sales',
    });
  }

  const typeStyles = {
    success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    neutral: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300',
  };

  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Insights</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`rounded-xl p-4 border ${typeStyles[insight.type]}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <insight.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                <p className="text-sm opacity-90">{insight.message}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}