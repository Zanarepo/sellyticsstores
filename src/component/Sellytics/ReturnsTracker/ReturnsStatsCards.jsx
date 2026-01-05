// src/components/returns-management/ReturnsStatsCards.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, AlertCircle, Package, HelpCircle } from 'lucide-react';
import { useCurrency } from '../../context/currencyContext';

export default function ReturnsStatsCards({ returns, commonReasons }) {
  const { formatPrice } = useCurrency();

  const totalReturns = returns.length;
  const totalValue = returns.reduce((sum, r) => sum + (r.amount || 0), 0);
  const returnedDemand = [...new Set(returns.map(r => r.product_name))].length;
  const topReasons = commonReasons.map(([reason, count]) => `${reason} (${count})`).join(', ') || 'No data';

  const cards = [
    { title: 'Total Returns', value: totalReturns, icon: AlertCircle, color: 'red' },
    { title: 'Returned Value', value: formatPrice(totalValue), icon: DollarSign, color: 'indigo' },
    { title: 'Returned Products', value: returnedDemand, icon: Package, color: 'blue' },
    { title: 'Top Reasons', value: topReasons, icon: HelpCircle, color: 'orange' },
  ];

  const colorMap = {
    red: 'from-red-500 to-rose-600',
    indigo: 'from-indigo-500 to-indigo-600',
    blue: 'from-blue-500 to-blue-600',
    orange: 'from-orange-500 to-amber-600',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${colorMap[card.color]} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{card.title}</h3>
              <p className="text-2xl font-bold text-slate-900 dark:text-white truncate">{card.value}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}