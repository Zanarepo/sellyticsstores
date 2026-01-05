import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingDown, AlertCircle, Package, TrendingUp, Percent } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';

export default function FinancialStatsCards({
  totalSales,
  totalExpenses,
  totalDebts,
  totalInventoryCost,
  totalProfit,
  profitMargin,
}) {
  const { formatPrice } = useCurrency();

  const cards = [
    {
      title: 'Total Sales',
      value: formatPrice(totalSales),
      icon: DollarSign,
      color: 'emerald',
      subtitle: 'Revenue generated',
    },
    {
      title: 'Total Expenses',
      value: formatPrice(totalExpenses),
      icon: TrendingDown,
      color: 'red',
      subtitle: 'Operating costs',
    },
    {
      title: 'Outstanding Debts',
      value: formatPrice(totalDebts),
      icon: AlertCircle,
      color: 'amber',
      subtitle: 'Receivables',
    },
    {
      title: 'Inventory Value',
      value: formatPrice(totalInventoryCost),
      icon: Package,
      color: 'blue',
      subtitle: 'Stock on hand',
    },
    {
      title: 'Net Profit',
      value: formatPrice(totalProfit),
      icon: TrendingUp,
      color: totalProfit >= 0 ? 'indigo' : 'red',
      subtitle: 'After expenses',
    },
    {
      title: 'Profit Margin',
      value: `${profitMargin}%`,
      icon: Percent,
      color: 'purple',
      subtitle: 'Profitability ratio',
    },
  ];

  const colorMap = {
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                {card.title}
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
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