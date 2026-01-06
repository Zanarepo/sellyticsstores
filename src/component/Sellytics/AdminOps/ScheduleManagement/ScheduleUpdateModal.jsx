// src/components/ScheduleManagement/ScheduleUpdateModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ScheduleUpdateModal({ isOpen, onClose, schedule, onSubmit }) {
  const [form, setForm] = useState({
    start_date: '',
    end_date: '',
    status: 'Working',
    reason: '',
  });

  useEffect(() => {
    if (schedule && isOpen) {
      setForm({
        start_date: schedule.start_date,
        end_date: schedule.end_date,
        status: schedule.status,
        reason: schedule.reason || '',
      });
    }
  }, [schedule, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.start_date > form.end_date) {
      toast.error('Start date cannot be after end date');
      return;
    }

    try {
      await onSubmit({
        id: schedule.id,
        staff_id: schedule.staff_id,
        start_date: form.start_date,
        end_date: form.end_date,
        status: form.status,
        reason: ['Working', 'Off'].includes(form.status) ? null : form.reason.trim(),
      });

      toast.success('Schedule updated successfully');
      onClose();
    } catch (err) {
      console.error('Update failed:', err);
      toast.error('Failed to update schedule');
    }
  };

  if (!isOpen || !schedule) return null;

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
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Update Schedule
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {schedule.store_users?.full_name || 'Staff Member'}
            </p>
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
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 sm:p-5 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Start Date</div>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-base sm:px-4 sm:py-3 sm:text-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">End Date</div>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-base sm:px-4 sm:py-3 sm:text-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Status */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Status</div>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-3 py-2 text-base sm:px-4 sm:py-3 sm:text-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="Working">Working</option>
              <option value="Off">Day Off</option>
              <option value="TimeOffRequested">Time Off Requested</option>
              <option value="TimeOffApproved">Time Off Approved</option>
              <option value="TimeOffRejected">Time Off Rejected</option>
            </select>
          </div>

          {/* Reason - Only for time-off statuses */}
          {!['Working', 'Off'].includes(form.status) && (
            <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Reason (Optional)</div>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                rows={4}
                placeholder="e.g., Family event, medical appointment..."
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900">
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 sm:px-6 sm:py-3 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 sm:px-8 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}