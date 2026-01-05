// components/attendance/AttendanceDashboard.jsx
import React, { useState,  useMemo } from 'react';
import { useAttendance } from './useAttendance';
import StatsCards from './StatsCards';
import AttendanceTable from './AttendanceTable';
import PermissionModal from './PermissionModal';
import BarcodeModal from './BarcodeModal';
import ScanModal from './ScanModal';

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

  const [selectedUserId, setSelectedUserId] = useState(null); // null = all users
  const [permissionOpen, setPermissionOpen] = useState(false);
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState([]);
  // Recalculate stats dynamically whenever logs, permissions, or selectedUserId changes
  const currentStats = useMemo(() => {
    return calculateStats(logs, permissions, selectedUserId);
  }, [logs, permissions, selectedUserId, calculateStats]);

  // Filtered logs for table (by selected user)
  const filteredLogs = useMemo(() => {
    if (!selectedUserId) return logs;
    return logs.filter(log => log.user_id === selectedUserId);
  }, [logs, selectedUserId]);

  // Handle checkbox selection
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

  const handleScan = (code) => {
    clockInOut(code);
    setScanOpen(false);
  };

  if (loading) return <div className="text-center py-16">Loading attendance data...</div>;
  if (error) return <div className="text-center py-16 text-red-600">{error}</div>;

  return (
    <>
   

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setScanOpen(true)}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
              >
                Scan Barcode
              </button>

              {isAdmin && (
                <button
                  onClick={() => setBarcodeOpen(true)}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Show Store Barcode
                </button>
              )}
             {isAdmin && (
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
    className="px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
  >
    Set Barcode Rotation
  </button>
)}


{/* 
              <button
                onClick={() => setPermissionOpen(true)}
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                {isAdmin ? 'Manage Permissions' : 'Request Permission'}
              </button>
*/}
              {isAdmin && selectedLogs.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                >
                  Delete Selected ({selectedLogs.length})
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={handleClearAll}
                  className="px-5 py-2.5 bg-red-800 text-white rounded-lg font-medium hover:bg-red-900"
                >
                  Clear All Logs
                </button>
              )}
 
            </div>
          </div>

{isAdmin && (
  <div className="mb-8">
    {/* Section Title (optional, looks nice) */}
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
      Admin Settings
    </h3>

    {/* Horizontal Layout on Medium+ Screens, Stacked on Mobile */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Shift Length Selector */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Standard Shift Length (for incomplete days)
        </label>
      <select
        value={localStorage.getItem('store_shift_hours') || '8'} // ← Direct from localStorage
        onChange={(e) => {
          const hours = e.target.value;
          localStorage.setItem('store_shift_hours', hours);
          updateStoreShiftHours(parseFloat(hours)); // Trigger recalculation
        
        }}
        className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
      >
        {[6, 7, 8, 9, 10, 11, 12].map((h) => (
          <option key={h} value={h}>
            {h} hours
          </option>
        ))}
      </select>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
          When staff forget to clock out, this shift length is assumed for payroll.
        </p>
      </div>

      {/* User Filter */}
      {users.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Filter by User
          </label>
          <select
            value={selectedUserId || ''}
            onChange={(e) =>
              setSelectedUserId(e.target.value ? Number(e.target.value) : null)
            }
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="">All Users ({logs.length} logs)</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name} ({logs.filter((l) => l.user_id === user.id).length} logs)
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  </div>
)}
 







          {/* Dynamic Stats Cards */}
          <StatsCards stats={currentStats} />

          {/* Attendance Table */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">
              Attendance Logs {selectedUserId && `- Filtered for ${users.find(u => u.id === selectedUserId)?.full_name}`}
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
      <ScanModal isOpen={scanOpen} onClose={() => setScanOpen(false)} onScan={handleScan} />
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