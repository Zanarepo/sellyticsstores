// RestockStats.jsx
import { motion } from 'framer-motion';
import { Package, AlertTriangle, CheckCircle } from 'lucide-react';

export default function RestockStats({ stats }) {
  const items = [
    { title: 'Total Forecasts', value: stats.total, icon: Package, color: 'indigo' },
    { title: 'Need Restock', value: stats.needRestock, icon: AlertTriangle, color: 'amber' },
    { title: 'Well Stocked', value: stats.wellStocked, icon: CheckCircle, color: 'emerald' },
  ];

  const colorMap = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((item, idx) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                {item.title}
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {item.value}
              </p>
            </div>
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${colorMap[item.color]}`}>
              <item.icon className="w-7 h-7" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}