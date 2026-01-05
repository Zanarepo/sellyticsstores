// src/component/Sellytics/AdminOps/TmeSheet/AttendanceTable.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Clock, User, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { format, parseISO, differenceInHours } from 'date-fns';

const ActionMenu = ({ onDelete, dateStr }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-slate-500 dark:text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                if (window.confirm(`Delete all logs for ${format(parseISO(dateStr), 'PPP')}?`)) {
                  onDelete();
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-left"
            >
              <Trash2 className="w-4 h-4" />
              Delete Day
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default function AttendanceTable({ logs, onDelete, isAdmin }) {
  // Admin-set expected shift length
  const expectedShift = parseFloat(localStorage.getItem('store_shift_hours') || '8');

  // Group logs by day
  const groupedLogs = React.useMemo(() => {
    const groups = {};
    logs.forEach(log => {
      const dateKey = format(parseISO(log.timestamp), 'yyyy-MM-dd');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(log);
    });
    return groups;
  }, [logs]);

  if (logs.length === 0) {
    return (
      <div className="text-center py-20">
        <Clock className="w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <p className="text-xl font-medium text-slate-600 dark:text-slate-400">No attendance logs yet</p>
        <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Clock in to start tracking attendance</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedLogs)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([dateKey, dayLogs]) => {
          const date = parseISO(dateKey);
          const formattedDate = format(date, 'EEEE, MMMM d, yyyy');

          const clockIn = dayLogs.find(l => l.action === 'clock-in');
          const clockOut = dayLogs.find(l => l.action === 'clock-out');

          let actualHours = 0;
          let hoursDisplay = '';
          let statusBadge = null;

          if (clockIn && clockOut) {
            // Real actual time worked
            actualHours = differenceInHours(parseISO(clockOut.timestamp), parseISO(clockIn.timestamp));
            if (actualHours < 0 || actualHours > 24) actualHours = 0; // sanitize

            const actualDisplay = actualHours.toFixed(1) + 'h worked';

            const diff = actualHours - expectedShift;

            if (diff >= 0) {
              if (diff === 0) {
                hoursDisplay = actualDisplay;
                statusBadge = (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                    Complete
                  </span>
                );
              } else {
                hoursDisplay = `${actualDisplay} · +${diff.toFixed(1)}h overtime`;
                statusBadge = (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                    <ArrowUpCircle className="w-4 h-4" />
                    +{diff.toFixed(1)}h overtime
                  </span>
                );
              }
            } else {
              hoursDisplay = `${actualDisplay} · ${Math.abs(diff).toFixed(1)}h deficit`;
              statusBadge = (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                  <ArrowDownCircle className="w-4 h-4" />
                  {Math.abs(diff).toFixed(1)}h deficit
                </span>
              );
            }
          } else if (clockIn) {
            // Incomplete
            hoursDisplay = `~${expectedShift.toFixed(1)}h (assumed)`;
            statusBadge = (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300">
                Incomplete
              </span>
            );
          }

          const userName = dayLogs[0]?.store_users?.full_name || 'Unknown User';

          const handleDeleteDay = () => {
            const ids = dayLogs.map(l => l.id);
            onDelete(ids);
          };

          return (
            <motion.div
              key={dateKey}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-lg transition-all"
            >
              {isAdmin && (
                <div className="absolute top-4 right-4 sm:hidden">
                  <ActionMenu onDelete={handleDeleteDay} dateStr={dateKey} />
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                      {userName}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {formattedDate}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      {statusBadge}
                      <span className="text-xl font-bold text-slate-900 dark:text-white">
                        {hoursDisplay}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-10">
                  <div className="grid grid-cols-2 gap-8 text-center">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Clock In</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                        {clockIn ? format(parseISO(clockIn.timestamp), 'HH:mm') : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Clock Out</p>
                      <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
                        {clockOut ? format(parseISO(clockOut.timestamp), 'HH:mm') : '—'}
                      </p>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="hidden sm:block">
                      <ActionMenu onDelete={handleDeleteDay} dateStr={dateKey} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
    </div>
  );
}