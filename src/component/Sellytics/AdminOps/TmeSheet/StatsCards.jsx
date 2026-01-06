import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  CalendarX, 
  Timer,
  Clock,
  ArrowUpCircle,
  ArrowDownCircle 
} from 'lucide-react';

const Card = ({ title, value, subtitle, icon: Icon, color, delay, valueClassName = '' }) => {
  const colors = {
    green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
    red: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
    slate: { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-400' },
  };

  const cardColor = colors[color] || colors.slate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700 shadow-sm"
    >
      <div className="flex items-start gap-3 flex-col sm:flex-row">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${cardColor.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${cardColor.text}`} />
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 truncate">{title}</p>
          <p className={`text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 ${valueClassName}`}>{value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 truncate">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default function StatsCards({ stats }) {
  const expectedShift = stats.storeShiftHours || 8;
  const overtimeHours = stats.overtime || 0;
  const deficitHours = stats.deficit || 0;
  const netBalance = overtimeHours - deficitHours;

  const balanceColor = netBalance > 0 ? 'green' : netBalance < 0 ? 'red' : 'slate';
  const balanceIcon = netBalance > 0 ? ArrowUpCircle : netBalance < 0 ? ArrowDownCircle : Clock;
  const balanceValue = `${netBalance > 0 ? '+' : ''}${netBalance.toFixed(1)}h`;

  const cardsData = [
    {
      title: 'Complete Days',
      value: stats.completeAttendances || 0,
      subtitle: 'Full in & out',
      icon: CheckCircle,
      color: 'green',
    },
    {
      title: 'Incomplete Days',
      value: stats.incompleteAttendances || 0,
      subtitle: `Assumed ${expectedShift}h`,
      icon: AlertCircle,
      color: 'orange',
    },
    {
      title: 'Total Hours',
      value: stats.totalHours || '0.0',
      subtitle: 'Actual + assumed',
      icon: Timer,
      color: 'blue',
    },
    {
      title: 'Time Balance',
      value: balanceValue,
      subtitle: `vs ${expectedShift}h expected`,
      icon: balanceIcon,
      color: balanceColor,
      valueClassName: `text-${balanceColor}-600 dark:text-${balanceColor}-400`,
    },
    {
      title: 'Absences',
      value: stats.absences || 0,
      subtitle: 'Mon–Fri, no clock-in',
      icon: CalendarX,
      color: 'purple',
      valueClassName: 'text-red-600 dark:text-red-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
      {cardsData.map((card, index) => (
        <Card key={card.title} {...card} delay={(index + 1) * 0.1} />
      ))}
    </div>
  );
}