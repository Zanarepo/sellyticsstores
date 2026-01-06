// src/components/ScheduleManagement/ScheduleManagement.jsx
import React, { useState } from 'react';
import useScheduleManagement from './hooks/useScheduleManagement';

import TimeOffRequestModal from './TimeOffRequestModal';
import ScheduleTable from './ScheduleTable';
import ScheduleStats from './ScheduleStats';
import ScheduleCreateModal from './ScheduleCreateModal';
import { Trash2, Calendar } from 'lucide-react';

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
      <div className="p-4 sm:p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-t-4 border-indigo-600"></div>
        <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600">Loading schedules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 text-center">
        <p className="text-base sm:text-lg text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-3 md:p-4 max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Compact Header */}
      <div className="mb-3 sm:mb-4 md:mb-6 px-1 sm:px-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-800 dark:text-indigo-300">
          Schedule Management
        </h1>
        <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
          Manage staff schedules and time-off requests
        </p>
      </div>

      {/* Stats Dashboard */}
      <ScheduleStats schedules={activeSchedules} staff={staff} />

      {/* Admin Create Button */}
      {isAdmin && (
        <div className="mb-3 sm:mb-4 md:mb-6 px-1 sm:px-2">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-xs sm:text-sm md:text-base rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 w-full sm:w-auto justify-center sm:justify-start"
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Create Schedule</span>
          </button>
        </div>
      )}

      {/* Staff Time-Off Request Button */}
      {isStaff && (
        <div className="mb-3 sm:mb-4 md:mb-6 px-1 sm:px-2">
          <button
            onClick={() => setRequestModalOpen(true)}
            className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-md active:scale-95"
          >
            Request Time Off
          </button>
        </div>
      )}

      {/* Compact Search & Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm sm:shadow-md p-2.5 sm:p-4 md:p-5 mb-3 sm:mb-4 md:mb-6 mx-1 sm:mx-2">
        <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-800 dark:text-gray-200 mb-2 sm:mb-3 md:mb-4">
          Search & Filter
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <div>
            <label className="block text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Staff Name
            </label>
            <input
              type="text"
              placeholder="Search..."
              value={filters.name}
              onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.dateStart}
              onChange={(e) => setFilters((f) => ({ ...f, dateStart: e.target.value }))}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.dateEnd}
              onChange={(e) => setFilters((f) => ({ ...f, dateEnd: e.target.value }))}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
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
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm sm:shadow-md overflow-hidden mb-4 sm:mb-6 md:mb-8 mx-1 sm:mx-2">
        <div className="p-2.5 sm:p-4 md:p-5 border-b dark:border-gray-700">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-200">
            Current & Upcoming <span className="text-xs sm:text-sm font-normal text-gray-500">({activeSchedules.length})</span>
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

      {/* Archived Schedules Section */}
      {archivedSchedules.length > 0 && (
        <div className="mt-6 sm:mt-8 md:mt-12 mx-1 sm:mx-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-600 dark:text-gray-400">
              Archived <span className="text-xs sm:text-sm font-normal">({archivedSchedules.length})</span>
            </h2>

            {/* Delete All Archived Button */}
            {isAdmin && (
              <button
                onClick={() => {
                  if (window.confirm('Permanently delete ALL archived schedules? This action cannot be undone.')) {
                    const ids = archivedSchedules.map((s) => s.id);
                    deleteSchedule(ids);
                  }
                }}
                className="w-full sm:w-auto px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-xs sm:text-sm rounded-md sm:rounded-lg transition flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Delete All Archived</span>
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

      {/* Modals */}
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