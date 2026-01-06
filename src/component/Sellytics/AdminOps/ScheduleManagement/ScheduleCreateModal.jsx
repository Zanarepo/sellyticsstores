// src/components/ScheduleManagement/ScheduleCreateModal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ScheduleCreateModal({ isOpen, onClose, staff, onSubmit }) {
  const [form, setForm] = useState({
    staff_id: '',
    start_date: '',
    end_date: '',
    status: 'Working',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.staff_id || !form.start_date || !form.end_date) {
      toast.error('Please fill all required fields');
      return;
    }

    if (form.start_date > form.end_date) {
      toast.error('Start date cannot be after end date');
      return;
    }

    try {
      await onSubmit({
        staff_id: parseInt(form.staff_id),
        start_date: form.start_date,
        end_date: form.end_date,
        status: form.status,
        reason: null,
      });

      toast.success('Schedule created successfully');
      setForm({ staff_id: '', start_date: '', end_date: '', status: 'Working' });
      onClose();
    } catch (err) {
      console.error('Create failed:', err);
      toast.error('Failed to create schedule');
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
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md md:max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Create New Schedule
            </h2>
            <p className="text-sm text-slate-500 mt-1">Assign working days or day off for staff</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 sm:space-y-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Staff Member */}
            <div className="lg:col-span-2 p-4 sm:p-5 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                Staff Member <span className="text-red-500">*</span>
              </label>
              <select
                name="staff_id"
                value={form.staff_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-base sm:px-4 sm:py-3 sm:text-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="">Select staff member</option>
                {staff.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.full_name} {member.role && `(${member.role})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-base sm:px-4 sm:py-3 sm:text-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            {/* End Date */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-base sm:px-4 sm:py-3 sm:text-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            {/* Status */}
            <div className="lg:col-span-2 p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                Schedule Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 text-base sm:px-4 sm:py-3 sm:text-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="Working">Working</option>
                <option value="Off">Day Off</option>
              </select>
            </div>
          </div>
        </form>

        {/* Footer */}
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
              Create Schedule
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}