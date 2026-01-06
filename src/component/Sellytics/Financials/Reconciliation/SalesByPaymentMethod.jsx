import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Wallet, Banknote, Building2 } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';

const methodIcons = {
  'Cash': Banknote,
  'Card': CreditCard,
  'Bank Transfer': Building2,
  'Wallet': Wallet,
  'default': CreditCard,
};

const colorMap = {
  'Cash': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
  'Card': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
  'Bank Transfer': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
  'Wallet': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
  'default': { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-400' },
};

export default function SalesByPaymentMethod({ salesByPaymentMethod }) {
  const { formatPrice } = useCurrency();

  if (Object.keys(salesByPaymentMethod).length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-6 border border-slate-200 dark:border-slate-700 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">No sales data available by payment method</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
      {Object.entries(salesByPaymentMethod).map(([method, data], idx) => {
        const Icon = methodIcons[method] || methodIcons['default'];
        const colors = colorMap[method] || colorMap['default'];

        return (
          <motion.div
            key={method}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-2.5 sm:p-4 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-start gap-2 sm:gap-3 flex-col sm:flex-row">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.text}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-xs text-slate-500 leading-tight truncate">
                  {method}
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {formatPrice(data.amount)}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}