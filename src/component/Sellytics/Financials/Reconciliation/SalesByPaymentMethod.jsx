import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Wallet, Banknote, Building2 } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';

const methodIcons = {
  'Cash': Banknote,
  'Card': CreditCard,
  'Bank Transfer': Building2,
  'Wallet': Wallet,
};

export default function SalesByPaymentMethod({ salesByPaymentMethod }) {
  const { formatPrice } = useCurrency();

  if (Object.keys(salesByPaymentMethod).length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center">
        <p className="text-slate-500 dark:text-slate-400">No sales data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sales by Payment Method</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Breakdown of transactions</p>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(salesByPaymentMethod).map(([method, data], idx) => {
          const Icon = methodIcons[method] || CreditCard;
          return (
            <motion.div
              key={method}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white">{method}</h4>
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                {formatPrice(data.amount)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {data.count} transaction{data.count !== 1 ? 's' : ''}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}