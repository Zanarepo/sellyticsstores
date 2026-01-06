// src/components/ScheduleManagement/TimeOffRequestModal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TimeOffRequestModal({ isOpen, onClose, onSubmit, userId }) {
  const [form, setForm] = useState({
    start_date: '',
    end_date: '',
    reason: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.start_date || !form.end_date || !form.reason.trim()) {
      toast.error('All fields are required');
      return;
    }

    if (form.start_date > form.end_date) {
      toast.error('Start date cannot be after end date');
      return;
    }

    try {
      await onSubmit({
        staff_id: userId,
        start_date: form.start_date,
        end_date: form.end_date,
        status: 'TimeOffRequested',
        reason: form.reason.trim(),
      });

      toast.success('Time-off request submitted successfully');
      setForm({ start_date: '', end_date: '', reason: '' });
      onClose();
    } catch (err) {
      console.error('Request failed:', err);
      toast.error('Failed to submit request');
    }
  };

  if (!isOpen) return null;

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
              Request Time Off
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Submit a new time-off request
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 sm:space-y-8 overflow-y-auto">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 sm:p-5 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">Start Date</div>
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
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">End Date</div>
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

          {/* Reason */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Reason <span className="text-red-500">*</span>
            </div>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              rows={5}
              required
              placeholder="e.g., Family wedding, medical appointment, vacation..."
              className="w-full px-3 py-2 text-base sm:px-4 sm:py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </form>

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
              type="submit"
              onClick={handleSubmit}
              className="px-6 py-2 sm:px-8 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition"
            >
              Submit Request
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}