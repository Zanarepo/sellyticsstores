// src/components/ScheduleManagement/ScheduleForm.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';


export default function ScheduleForm({ staff, onSubmit }) {
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

if (!localStorage.getItem('store_id')) {
  toast.error('Store not loaded. Please refresh or log in again.');
  return;
}


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

      toast.success(`Schedule created for ${staff.find(s => s.id === parseInt(form.staff_id))?.full_name}`);
      setForm({ staff_id: '', start_date: '', end_date: '', status: 'Working' });
    } catch (err) {
      toast.error('Failed to create schedule');
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl mb-8 shadow-md">
      <h3 className="text-xl font-semibold text-indigo-800 dark:text-indigo-200 mb-4">
        Create Staff Schedule
      </h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Staff Member
          </label>
          <select
            name="staff_id"
            value={form.staff_id}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">Select staff</option>
            {staff.map(member => (
              <option key={member.id} value={member.id}>
                {member.full_name} ({member.role || 'Staff'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Date
          </label>
          <input
            type="date"
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Date
          </label>
          <input
            type="date"
            name="end_date"
            value={form.end_date}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="Working">Working</option>
            <option value="Off">Day Off</option>
          </select>
        </div>

        <div className="md:col-span-4 flex items-end">
          <button
            type="submit"
            className="w-full md:w-auto px-8 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            Create Schedule
          </button>
        </div>
      </form>
    </div>
  );
}