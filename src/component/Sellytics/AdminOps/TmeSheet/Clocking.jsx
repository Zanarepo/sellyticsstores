// components/attendance/AttendanceDashboard.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { useAttendance } from './useAttendance';
import StatsCards from './StatsCards';
import AttendanceTable from './AttendanceTable';
import PermissionModal from './PermissionModal';
import BarcodeModal from './BarcodeModal';
import ScanModal from './ScanModal';
import { QrCode, Barcode, Settings, Trash2 } from 'lucide-react';

export default function AttendanceDashboard() {
  const {
    loading,
    error,
    isAdmin,
    logs,
    permissions,
    users,
    calculateStats,
    clockInOut,
    requestPermission,
    approvePermission,
    deleteLogs,
    clearAll,
    storeId,
    updateStoreShiftHours,
  } = useAttendance();

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [permissionOpen, setPermissionOpen] = useState(false);
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState([]);

  const currentStats = useMemo(() => {
    return calculateStats(logs, permissions, selectedUserId);
  }, [logs, permissions, selectedUserId, calculateStats]);

  const filteredLogs = useMemo(() => {
    if (!selectedUserId) return logs;
    return logs.filter(log => log.user_id === selectedUserId);
  }, [logs, selectedUserId]);

  const handleSelect = (id) => (e) => {
    if (id === 'all') {
      setSelectedLogs(e.target.checked ? filteredLogs.map(l => l.id) : []);
    } else {
      setSelectedLogs(prev =>
        e.target.checked ? [...prev, id] : prev.filter(i => i !== id)
      );
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Delete ${selectedLogs.length} selected logs?`)) {
      deleteLogs(selectedLogs);
      setSelectedLogs([]);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('⚠️ Permanently delete ALL attendance logs for this store?')) {
      clearAll();
    }
  };

  const handleScan = useCallback((code) => {
    clockInOut(code);
    setScanOpen(false);
  }, [clockInOut]);

  const handleCloseScan = useCallback(() => {
    setScanOpen(false);
  }, []);

  if (loading) return <div className="text-center py-12 sm:py-16">Loading attendance data...</div>;
  if (error) return <div className="text-center py-12 sm:py-16 text-red-600">{error}</div>;

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-3 sm:px-4 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          {/* Compact Header with Action Buttons */}
          <div className="mb-4 sm:mb-6">
            {/* Primary Actions - Compact Row */}
            <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
              <button
                onClick={() => setScanOpen(true)}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <QrCode className="w-4 h-4" />
                <span className="hidden xs:inline">Scan</span>
              </button>

              {isAdmin && (
                <>
                  <button
                    onClick={() => setBarcodeOpen(true)}
                    className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Barcode className="w-4 h-4" />
                    <span className="hidden xs:inline">Store Code</span>
                  </button>

                  <button
                    onClick={() => {
                      const options = ['daily', 'weekly', 'monthly'];
                      const choice = prompt(
                        'Set barcode rotation frequency:\nType: daily, weekly, or monthly',
                        localStorage.getItem('barcode_rotation') || 'daily'
                      );
                      if (options.includes(choice?.toLowerCase())) {
                        localStorage.setItem('barcode_rotation', choice.toLowerCase());
                        alert(`Barcode rotation set to: ${choice.toLowerCase()}`);
                      } else if (choice !== null) {
                        alert('Invalid choice. Use: daily, weekly, or monthly');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Rotation</span>
                  </button>

                  {selectedLogs.length > 0 && (
                    <button
                      onClick={handleDeleteSelected}
                      className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden xs:inline">Delete ({selectedLogs.length})</span>
                      <span className="xs:hidden">{selectedLogs.length}</span>
                    </button>
                  )}

                  <button
                    onClick={handleClearAll}
                    className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-800 text-white rounded-lg text-sm font-medium hover:bg-red-900 transition-colors ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Clear All</span>
                  </button>
                </>
              )}
            </div>

            {/* Admin Settings - Compact Cards */}
            {isAdmin && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                {/* Shift Length */}
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 sm:p-4">
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Standard Shift
                  </label>
                  <select
                    value={localStorage.getItem('store_shift_hours') || '8'}
                    onChange={(e) => {
                      const hours = e.target.value;
                      localStorage.setItem('store_shift_hours', hours);
                      updateStoreShiftHours(parseFloat(hours));
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {[6, 7, 8, 9, 10, 11, 12].map((h) => (
                      <option key={h} value={h}>{h} hours</option>
                    ))}
                  </select>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-500 mt-1.5">
                    For incomplete days
                  </p>
                </div>

                {/* User Filter */}
                {users.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 sm:p-4">
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Filter by User
                    </label>
                    <select
                      value={selectedUserId || ''}
                      onChange={(e) =>
                        setSelectedUserId(e.target.value ? Number(e.target.value) : null)
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="">All Users ({logs.length})</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.full_name} ({logs.filter((l) => l.user_id === user.id).length})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <StatsCards stats={currentStats} />

          {/* Attendance Table */}
          <div className="mt-6 sm:mt-8">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-3 sm:mb-4">
              {selectedUserId 
                ? `Logs - ${users.find(u => u.id === selectedUserId)?.full_name}` 
                : 'All Attendance Logs'
              }
            </h2>
            <AttendanceTable
              logs={filteredLogs}
              selected={selectedLogs}
              onSelect={handleSelect}
              onDelete={deleteLogs}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <BarcodeModal isOpen={barcodeOpen} onClose={() => setBarcodeOpen(false)} storeId={storeId} />
      <ScanModal isOpen={scanOpen} onClose={handleCloseScan} onScan={handleScan} />
      <PermissionModal
        isOpen={permissionOpen}
        onClose={() => setPermissionOpen(false)}
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.target);
          requestPermission({
            start_date: form.get('start_date'),
            end_date: form.get('end_date'),
            reason: form.get('reason')
          });
          e.target.reset();
        }}
        isAdmin={isAdmin}
        permissions={permissions}
        onApprove={approvePermission}
      />
    </>
  );
}