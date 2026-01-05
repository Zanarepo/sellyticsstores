// components/attendance/StatsCards.jsx
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

export default function StatsCards({ stats }) {
  const expectedShift = stats.storeShiftHours || 8;

  // Calculate overtime/deficit
  const overtimeHours = stats.overtime || 0;
  const deficitHours = stats.deficit || 0;
  const netBalance = overtimeHours - deficitHours;

  const balanceColor = netBalance > 0 
    ? 'text-green-600 dark:text-green-400' 
    : netBalance < 0 
    ? 'text-red-600 dark:text-red-400' 
    : 'text-slate-600 dark:text-slate-400';

  const balanceIcon = netBalance > 0 
    ? ArrowUpCircle 
    : netBalance < 0 
    ? ArrowDownCircle 
    : Clock;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {/* Complete Days */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Complete Days
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {stats.completeAttendances || 0}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              Full in & out
            </p>
          </div>
        </div>
      </motion.div>

      {/* Incomplete Days */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-7 h-7 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Incomplete Days
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {stats.incompleteAttendances || 0}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              Assumed {expectedShift}h
            </p>
          </div>
        </div>
      </motion.div>

      {/* Total Hours */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <Timer className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Hours
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {stats.totalHours || '0.0'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              Actual + assumed
            </p>
          </div>
        </div>
      </motion.div>

      {/* Overtime / Deficit Balance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            netBalance > 0 ? 'bg-green-100 dark:bg-green-900/30' :
            netBalance < 0 ? 'bg-red-100 dark:bg-red-900/30' :
            'bg-slate-100 dark:bg-slate-700'
          }`}>
            {React.createElement(balanceIcon, { 
              className: `w-7 h-7 ${netBalance > 0 ? 'text-green-600 dark:text-green-400' : 
                                   netBalance < 0 ? 'text-red-600 dark:text-red-400' : 
                                   'text-slate-600 dark:text-slate-400'}`
            })}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Time Balance
            </p>
            <p className={`text-2xl font-bold mt-1 ${balanceColor}`}>
              {netBalance > 0 ? `+${netBalance.toFixed(1)}` : netBalance.toFixed(1)}h
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              vs {expectedShift}h expected
            </p>
          </div>
        </div>
      </motion.div>

      {/* Absences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
            <CalendarX className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Absences
            </p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
              {stats.absences || 0}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              Mon–Fri, no clock-in
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}