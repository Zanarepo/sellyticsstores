// src/components/ScheduleManagement/ScheduleStats.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  CalendarX2, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  CalendarCheck 
} from 'lucide-react';
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isWithinInterval, 
  parseISO 
} from 'date-fns';

const StatCard = ({ stat, index, daysInMonth, totalStaff }) => {
  const Icon = stat.icon;
  return (
    <motion.div
      key={stat.label}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700 shadow-sm bg-gradient-to-br ${stat.gradient}`}
    >
      <div className="flex items-start gap-3 flex-col sm:flex-row">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${stat.bgIcon} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`} />
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 truncate">
            {stat.label}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stat.value}
          </p>
          {stat.label === 'Monthly Coverage' && (
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 truncate">
              Based on {totalStaff} staff
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function ScheduleStats({ schedules, staff, currentMonth = new Date() }) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const totalStaff = staff.length;

  const activeTimeOff = schedules.filter(s => 
    ['TimeOffApproved', 'TimeOffRequested'].includes(s.status) &&
    isWithinInterval(new Date(), { start: parseISO(s.start_date), end: parseISO(s.end_date) })
  ).length;

  const pendingRequests = schedules.filter(s => s.status === 'TimeOffRequested').length;
  const approvedTimeOff = schedules.filter(s => s.status === 'TimeOffApproved').length;
  const rejectedTimeOff = schedules.filter(s => s.status === 'TimeOffRejected').length;

  const workingDaysThisMonth = schedules.reduce((acc, s) => {
    if (s.status !== 'Working') return acc;
    const scheduleDays = eachDayOfInterval({
      start: parseISO(s.start_date),
      end: parseISO(s.end_date)
    }).filter(day => isWithinInterval(day, { start: monthStart, end: monthEnd }));
    return acc + scheduleDays.length;
  }, 0);

  const totalScheduledDays = daysInMonth.length * totalStaff;
  const coveragePercentage = totalScheduledDays > 0 
    ? Math.round((workingDaysThisMonth / totalScheduledDays) * 100) 
    : 0;

  const stats = [
    {
      label: 'Total Staff',
      value: totalStaff,
      icon: Users,
      gradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      bgIcon: 'bg-indigo-100 dark:bg-indigo-900/30',
    },
    {
      label: 'Active Time Off',
      value: activeTimeOff,
      icon: CalendarX2,
      gradient: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
      bgIcon: 'bg-red-100 dark:bg-red-900/30',
    },
    {
      label: 'Pending Requests',
      value: pendingRequests,
      icon: AlertCircle,
      gradient: 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      bgIcon: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      label: 'Approved Time Off',
      value: approvedTimeOff,
      icon: CheckCircle,
      gradient: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgIcon: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      label: 'Rejected Requests',
      value: rejectedTimeOff,
      icon: XCircle,
      gradient: 'from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20',
      iconColor: 'text-gray-600 dark:text-gray-400',
      bgIcon: 'bg-gray-100 dark:bg-gray-900/30',
    },
    {
      label: 'Monthly Coverage',
      value: `${coveragePercentage}%`,
      icon: CalendarCheck,
      gradient: coveragePercentage >= 90 
        ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
        : 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20',
      iconColor: coveragePercentage >= 90 
        ? 'text-green-600 dark:text-green-400' 
        : 'text-yellow-600 dark:text-yellow-400',
      bgIcon: coveragePercentage >= 90 
        ? 'bg-green-100 dark:bg-green-900/30'
        : 'bg-yellow-100 dark:bg-yellow-900/30',
    },
  ];

  // The last card has a different color logic, so we adjust it here.
  const lastStat = stats[stats.length - 1];
  if (coveragePercentage < 70) {
    lastStat.gradient = 'from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20';
    lastStat.iconColor = 'text-red-600 dark:text-red-400';
    lastStat.bgIcon = 'bg-red-100 dark:bg-red-900/30';
  }


  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-8">
      {stats.map((stat, index) => (
        <StatCard 
          key={stat.label} 
          stat={stat} 
          index={index} 
          daysInMonth={daysInMonth} 
          totalStaff={totalStaff} 
        />
      ))}
    </div>
  );
}