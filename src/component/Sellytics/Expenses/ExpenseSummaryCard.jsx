// src/components/Expenses/ExpenseSummaryCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Calendar, CalendarDays } from 'lucide-react';
import { useCurrency } from '../../context/currencyContext';

export default function ExpenseSummaryCard({
  totalExpenses = 0,
  monthlyExpenses = 0,
  todayExpenses = 0,
}) {
  const { formatPrice } = useCurrency();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      {/* Total Expenses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-7 h-7 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Expenses
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {formatPrice(totalExpenses)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* This Month */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-7 h-7 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              This Month
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {formatPrice(monthlyExpenses)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Today */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Today's Expenses
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {formatPrice(todayExpenses)}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}