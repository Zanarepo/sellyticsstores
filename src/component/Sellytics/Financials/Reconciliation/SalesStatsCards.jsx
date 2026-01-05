import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, CreditCard, Receipt } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';

export default function SalesStatsCards({ totalSalesAmount, salesByPaymentMethod, sales, selectedPaymentMethod }) {
  const { formatPrice } = useCurrency();

  const totalTransactions = sales.length;
  const uniqueMethods = Object.keys(salesByPaymentMethod).length;
  const avgTransaction = totalTransactions > 0 ? totalSalesAmount / totalTransactions : 0;

  const cards = [
    {
      title: 'Total Sales',
      value: formatPrice(totalSalesAmount),
      icon: DollarSign,
      color: 'indigo',
      subtitle: `${totalTransactions} transactions`,
    },
    {
      title: 'Payment Methods',
      value: uniqueMethods,
      icon: CreditCard,
      color: 'blue',
      subtitle: 'Active methods',
    },
    {
      title: 'Average Sale',
      value: formatPrice(avgTransaction),
      icon: TrendingUp,
      color: 'emerald',
      subtitle: 'Per transaction',
    },
    {
      title: 'Filter Active',
      value: selectedPaymentMethod || 'All',
      icon: Receipt,
      color: 'purple',
      subtitle: 'Current view',
      truncate: true,
    },
  ];

  const colorMap = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all"
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