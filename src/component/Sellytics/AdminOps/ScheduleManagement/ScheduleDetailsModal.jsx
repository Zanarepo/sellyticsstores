// src/components/ScheduleManagement/ScheduleDetailsModal.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { X, User, Calendar, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

export default function ScheduleDetailsModal({
  isOpen,
  onClose,
  schedule,
  isAdmin,
  currentUserId,
  onApprove,
  onReject,
  handleCancel,
  onDelete,
}) {
  if (!isOpen || !schedule) return null;

  const isOwnRequest = schedule.staff_id === currentUserId;
  const isPendingRequest = schedule.status === 'TimeOffRequested';

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

  const statusConfig = getStatusConfig(schedule.status);
  const StatusIcon = statusConfig.icon;

  const handleApprove = async () => {
    try {
      await onApprove(schedule.id);
      toast.success('Time-off approved');
      onClose();
    } catch (err) {
      console.error('Approve failed:', err);
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async () => {
    try {
      await onReject(schedule.id);
      toast.success('Time-off rejected');
      onClose();
    } catch (err) {
      console.error('Reject failed:', err);
      toast.error('Failed to reject request');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this schedule?')) return;
    try {
      await onDelete(schedule.id);
      toast.success('Schedule deleted');
      onClose();
    } catch {
      toast.error('Failed to delete schedule');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md md:max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Schedule Details
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {schedule.store_users?.full_name || 'Staff Member'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 overflow-y-auto">
          {/* Date Range Card */}
          <div className="p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 mb-2">
              <Calendar className="w-5 h-5" />
              Date Range
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {format(parseISO(schedule.start_date), 'PPP')} → {format(parseISO(schedule.end_date), 'PPP')}
            </p>
          </div>

          {/* Status Card */}
          <div className="p-4 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl">
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 mb-2">
              <StatusIcon className="w-5 h-5" />
              Status
            </div>
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-base font-bold
                ${statusConfig.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : ''}
                ${statusConfig.color === 'gray' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : ''}
                ${statusConfig.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' : ''}
                ${statusConfig.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' : ''}
                ${statusConfig.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' : ''}
              `}
            >
              <StatusIcon className="w-5 h-5" />
              {statusConfig.label}
            </span>
          </div>

          {/* Reason Card - Only if exists */}
          {schedule.reason && (
            <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">Reason</div>
              <p className="text-base sm:text-lg text-slate-900 dark:text-white italic">
                "{schedule.reason}"
              </p>
            </div>
          )}
        </div>

        {/* Sticky Footer - Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900">
          <div className="flex flex-wrap gap-4 justify-end">
            {/* Admin: Approve / Reject */}
            {isAdmin && isPendingRequest && (
              <>
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition shadow-md"
                >
                  Approve Request
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition shadow-md"
                >
                  Reject Request
                </button>
              </>
            )}

            {/* Staff: Cancel own request */}
            {!isAdmin && isOwnRequest && isPendingRequest && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition shadow-md"
              >
                Cancel Request
              </button>
            )}

            {/* Admin: Delete */}
            {isAdmin && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition shadow-md"
              >
                Delete Schedule
              </button>
            )}

            <button
              onClick={onClose}
              className="px-6 py-2 sm:px-8 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}