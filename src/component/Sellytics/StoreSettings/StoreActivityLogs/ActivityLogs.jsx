// components/activity/ActivityLogDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Search, Activity } from 'lucide-react';
import { useActivityLogs } from './useActivityLogs';
import ActivityCard from './ActivityCard';

import LogDetailsModal from './LogDetailsModal';
import ClearAllLogsModal from './ClearAllLogsModal';

const ITEMS_PER_PAGE = 10;

export default function ActivityLogDashboard() {
  const { logs, loading, error, canDelete, deleteLog, clearAllLogs } = useActivityLogs();

  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('card');
  const [selectedLog, setSelectedLog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Load view preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('activityLogView');
    if (saved === 'card' || saved === 'table') {
      setView(saved);
    }
  }, []);

  // Save view preference when changed
  useEffect(() => {
    localStorage.setItem('activityLogView', view);
  }, [view]);

  // Filter logs
  const filtered = logs.filter(log =>
    (log.dynamic_product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.activity_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Recent logs badge (last 24 hours)
  const recentCount = logs.filter(l =>
    new Date(l.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;

  // Handle clear all
  const handleClearAll = async () => {
    setClearing(true);
    const success = await clearAllLogs();
    setClearing(false);
    if (success) {
      setClearModalOpen(false);
      setCurrentPage(1); // Reset to first page
    }
  };

  return (
    <>
   

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Activity Logs
              </h1>
              {recentCount > 0 && (
                <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 rounded-full text-sm font-bold animate-pulse">
                  {recentCount} new
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-4 py-2.5 w-full sm:w-80 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Actions Row */}
              <div className="flex items-center gap-3">
                {/* Clear All Button - Only for owners with logs */}
                {canDelete && logs.length > 0 && (
                  <button
                    onClick={() => setClearModalOpen(true)}
                    className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition shadow-md whitespace-nowrap"
                  >
                    Clear All Logs
                  </button>
                )}

                {/* View Toggle */}
               
              </div>
            </div>
          </div>

          {/* Main Content */}
          {loading ? (
            <div className="space-y-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-white dark:bg-slate-800 rounded-xl animate-pulse shadow-sm" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-600 text-xl">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Activity className="w-20 h-20 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No activity logs found</p>
            </div>
          ) : (
            <>
              {/* Log Cards */}
              <div className="space-y-6">
                {paginated.map((log) => (
                  <ActivityCard
                    key={`${log.source}-${log.id}`}
                    log={log}
                    onView={setSelectedLog}
                    onDelete={deleteLog}
                    canDelete={canDelete}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-6 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition font-medium"
                  >
                    Previous
                  </button>

                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-6 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition font-medium"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals - Outside the list */}
      <LogDetailsModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />

      <ClearAllLogsModal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        onConfirm={handleClearAll}
        isLoading={clearing}
      />
    </>
  );
}