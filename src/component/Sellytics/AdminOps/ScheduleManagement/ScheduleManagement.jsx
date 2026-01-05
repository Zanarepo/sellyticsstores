// src/components/ScheduleManagement/ScheduleManagement.jsx
import React, { useState } from 'react';
import useScheduleManagement from './hooks/useScheduleManagement'; // ← Correct path

import TimeOffRequestModal from './TimeOffRequestModal';
import ScheduleTable from './ScheduleTable';
import ScheduleStats from './ScheduleStats';
import ScheduleCreateModal from './ScheduleCreateModal';
import { Trash2, Calendar} from 'lucide-react';

export default function ScheduleManagement() {
  const {
    staff,
    userId,
    isAdmin,
    isStaff,
    loading,
    error,
    activeSchedules,
    archivedSchedules,
    approveTimeOff,
    rejectTimeOff,
    filters,
    setFilters,
    createOrUpdateSchedule,
    deleteSchedule,
  } = useScheduleManagement();

  const [requestModalOpen, setRequestModalOpen] = useState(false);
const [createModalOpen, setCreateModalOpen] = useState(false);
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
        <p className="mt-4 text-lg text-gray-600">Loading schedules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-xl text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-indigo-800 dark:text-indigo-300">
          Schedule Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage staff schedules and time-off requests
        </p>
      </div>

      {/* Stats Dashboard */}
      <ScheduleStats schedules={activeSchedules} staff={staff} />

    {isAdmin && (
  <div className="mb-12">
    <div className="flex items-center gap-4">
      <button
        onClick={() => setCreateModalOpen(true)}
        className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        <Calendar className="w-6 h-6" />
        Create Schedule
      </button>
    
    </div>
  </div>
)}

      {/* Staff: Time-Off Request Button */}
      {isStaff && (
        <div className="mb-10">
          <button
            onClick={() => setRequestModalOpen(true)}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
          >
            Request Time Off
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-10">
        <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-6">
          Search & Filter Schedules
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Staff Name
            </label>
            <input
              type="text"
              placeholder="Search by name..."
              value={filters.name}
              onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.dateStart}
              onChange={(e) => setFilters((f) => ({ ...f, dateStart: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.dateEnd}
              onChange={(e) => setFilters((f) => ({ ...f, dateEnd: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">All Status</option>
              <option value="Working">Working</option>
              <option value="Off">Day Off</option>
              <option value="TimeOffRequested">Requested</option>
              <option value="TimeOffApproved">Approved</option>
              <option value="TimeOffRejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Current & Upcoming Schedules */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-16">
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Current & Upcoming Schedules ({activeSchedules.length})
          </h3>
        </div>
        <ScheduleTable
          schedules={activeSchedules}
          isAdmin={isAdmin}
          isStaff={isStaff}
          currentUserId={userId}
          onUpdate={createOrUpdateSchedule}
          onDelete={deleteSchedule}
          onApprove={approveTimeOff}
          onReject={rejectTimeOff}
        />
      </div>

      {/* Archived Schedules Section - ONLY ONE DELETE BUTTON HERE */}
      {archivedSchedules.length > 0 && (
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-400">
              Archived Schedules ({archivedSchedules.length})
            </h2>

            {/* SINGLE "Delete All Archived" button */}
            {isAdmin && (
              <button
                onClick={() => {
                  if (window.confirm('Permanently delete ALL archived schedules? This action cannot be undone.')) {
                    const ids = archivedSchedules.map((s) => s.id);
                    deleteSchedule(ids);
                  }
                }}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition flex items-center gap-2 shadow-md"
              >
                <Trash2 className="w-5 h-5" />
                Delete All Archived
              </button>
            )}
          </div>

          <div className="opacity-75">
            <ScheduleTable
              schedules={archivedSchedules}
              isAdmin={isAdmin}
              isStaff={isStaff}
              currentUserId={userId}
              onUpdate={createOrUpdateSchedule}
              onDelete={deleteSchedule}
              onApprove={approveTimeOff}
              onReject={rejectTimeOff}
              showArchivedStyle
            />
          </div>
        </div>
      )}

      {/* Time-Off Request Modal */}
      <TimeOffRequestModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        onSubmit={createOrUpdateSchedule}
        userId={userId}
      />
      <ScheduleCreateModal
  isOpen={createModalOpen}
  onClose={() => setCreateModalOpen(false)}
  staff={staff}
  onSubmit={createOrUpdateSchedule}
/>
    </div>
    
  );
}