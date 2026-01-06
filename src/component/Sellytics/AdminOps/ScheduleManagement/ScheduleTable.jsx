// src/components/ScheduleManagement/ScheduleTable.jsx
import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  MoreVertical,
  Edit,
  Trash2 
} from 'lucide-react';
import ScheduleDetailsModal from './ScheduleDetailsModal';
import ScheduleUpdateModal from './ScheduleUpdateModal';

export default function ScheduleTable({
  schedules,
  isAdmin,
  currentUserId,
  onUpdate,
  onDelete,
  onApprove,
  onReject,
  showArchivedStyle = false
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const openDetails = (schedule) => {
    setSelected(schedule);
    setDetailsOpen(true);
  };

  const openUpdate = (schedule) => {
    setSelected(schedule);
    setUpdateOpen(true);
  };

  const toggleMenu = (scheduleId, e) => {
    e.stopPropagation();
    setOpenMenuId(prev => prev === scheduleId ? null : scheduleId);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Working':
        return { icon: CheckCircle, color: 'green', label: 'Working' };
      case 'Off':
        return { icon: XCircle, color: 'gray', label: 'Day Off' };
      case 'TimeOffRequested':
        return { icon: AlertCircle, color: 'yellow', label: 'Pending Request' };
      case 'TimeOffApproved':
        return { icon: CheckCircle, color: 'blue', label: 'Approved' };
      case 'TimeOffRejected':
        return { icon: XCircle, color: 'red', label: 'Rejected' };
      default:
        return { icon: Calendar, color: 'indigo', label: status };
    }
  };

  return (
    <>
      {/* REMOVED: No "Clear All Schedules" button here anymore */}
      {/* This button was causing the duplicate — now only exists in archived section */}

      {/* Card List */}
      <div className="space-y-4">
        {schedules.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-gray-500">No schedules found</p>
          </div>
        ) : (
          schedules.map((schedule) => {
            const statusConfig = getStatusConfig(schedule.status);
            const StatusIcon = statusConfig.icon;
            const isMenuOpen = openMenuId === schedule.id;

            return (
              <motion.div
                key={schedule.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => openDetails(schedule)}
                className={`relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm transition-all cursor-pointer
                  ${showArchivedStyle ? 'opacity-60 grayscale' : 'hover:shadow-lg'}
                `}
              >
                {/* Admin Action Menu */}
                {isAdmin && (
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={(e) => toggleMenu(schedule.id, e)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    >
                      <MoreVertical className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openUpdate(schedule);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Schedule
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete this schedule?')) {
                              onDelete(schedule.id);
                            }
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-3"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Schedule
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Click outside closes menu */}
                {isMenuOpen && (
                  <div
                    className="fixed inset-0 z-0"
                    onClick={() => setOpenMenuId(null)}
                  />
                )}

                <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white">
                        {schedule.store_users?.full_name || 'Unknown Staff'}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {format(parseISO(schedule.start_date), 'MMM d, yyyy')} → {format(parseISO(schedule.end_date), 'MMM d, yyyy')}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold
                            ${statusConfig.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : ''}
                            ${statusConfig.color === 'gray' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : ''}
                            ${statusConfig.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' : ''}
                            ${statusConfig.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' : ''}
                            ${statusConfig.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' : ''}
                          `}
                        >
                          <StatusIcon className="w-4 h-4" />
                          {statusConfig.label}
                        </span>

                        {schedule.reason && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 italic max-w-md">
                            "{schedule.reason}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <ScheduleDetailsModal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        schedule={selected}
        isAdmin={isAdmin}
        currentUserId={currentUserId}
        onApprove={onApprove}
        onReject={onReject}
        onDelete={onDelete}
      />

      <ScheduleUpdateModal
        isOpen={updateOpen}
        onClose={() => setUpdateOpen(false)}
        schedule={selected}
        onSubmit={onUpdate}
      />
    </>
  );
}