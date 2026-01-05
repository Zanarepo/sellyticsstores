import React from 'react';
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCurrency } from '../../../context/currencyContext';

export default function DiscrepanciesCard({ totalDiscrepancy, discrepanciesByPaymentMethod }) {
  const { formatPrice } = useCurrency();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            totalDiscrepancy > 0 
              ? 'bg-red-100 dark:bg-red-900/30' 
              : 'bg-emerald-100 dark:bg-emerald-900/30'
          }`}>
            <AlertCircle className={`w-5 h-5 ${
              totalDiscrepancy > 0 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-emerald-600 dark:text-emerald-400'
            }`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Total Discrepancies</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Differences between expected and actual</p>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-xl p-4 ${
            totalDiscrepancy > 0 
              ? 'bg-red-50 dark:bg-red-900/20' 
              : 'bg-emerald-50 dark:bg-emerald-900/20'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {totalDiscrepancy > 0 ? (
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            ) : (
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            )}
            <h4 className="font-semibold text-slate-900 dark:text-white">All Methods</h4>
          </div>
          <p className={`text-2xl font-bold ${
            totalDiscrepancy > 0 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {formatPrice(Math.abs(totalDiscrepancy))}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {totalDiscrepancy > 0 ? 'Short' : totalDiscrepancy < 0 ? 'Over' : 'Balanced'}
          </p>
        </motion.div>

        {/* By Payment Method */}
        {Object.entries(discrepanciesByPaymentMethod).map(([method, discrepancy], idx) => (
          <motion.div
            key={method}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`rounded-xl p-4 ${
              discrepancy > 0 
                ? 'bg-red-50 dark:bg-red-900/20' 
                : 'bg-emerald-50 dark:bg-emerald-900/20'
            }`}
          >
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{method}</h4>
            <p className={`text-xl font-bold ${
              discrepancy > 0 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {formatPrice(Math.abs(discrepancy))}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {discrepancy > 0 ? 'Short' : discrepancy < 0 ? 'Over' : 'Balanced'}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}