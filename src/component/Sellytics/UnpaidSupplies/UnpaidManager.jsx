// src/components/Debts/DebtsManager.jsx
import React, { useState, useEffect } from 'react';
import DebtTable from './DebtTable'; // or DebtCard if you switched
import EditDebtModal from './EditDebtModal';
import DebtDetailModal from './DebtDetailModal';
import ScannerModal from './ScannerModal';
//import {toast} from 'react-hot-toast';
import useDebt from './useDebt';
import DeviceDebtRepayment from '../../UserDashboard/DeviceDebtRepayment';
import { getUserPermission } from '../../../utils/accessControl';

export default function DebtsManager() {
  const {
    filteredDebts = [],
    searchTerm,
    setSearchTerm,
    editing,
    setEditing,
    showDetail,
    setShowDetail,
    showScanner,
    handleScanSuccess,
    closeScanner,
    fetchDebts,
    deleteDebtFromDatabase,
    isLoading = false,
    error = null,
  } = useDebt();

  const storeId = localStorage.getItem('store_id');
  const currentUserEmail = localStorage.getItem('user_email');

  const [permissions, setPermissions] = useState({
    canView: false,
    canEdit: false,
    canDelete: false,
  });

  useEffect(() => {
    async function loadPermissions() {
      if (!storeId || !currentUserEmail) return;
      const perms = await getUserPermission(storeId, currentUserEmail);
      setPermissions({
        canView: perms.canView,
        canEdit: perms.canEdit,
        canDelete: perms.canDelete,
      });
    }
    loadPermissions();
  }, [storeId, currentUserEmail]);

  if (!storeId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-xl font-bold">Store ID missing — please log in</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-indigo-600 text-xl">Loading debts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-xl">Error loading debts: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <DeviceDebtRepayment />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Debts Overview</h1>
          <button
            onClick={() => setEditing({})} // Opens modal for new debt
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Add New Debt
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-xl">
          <input
            type="text"
            placeholder="Search by customer, product, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
          <svg
            className="absolute left-3 top-3.5 w-5 h-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Debt List */}
        {filteredDebts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            No debts found. Add one to get started!
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDebts.map((debt) => (
              <DebtTable
                key={debt.id}
                debt={debt}
                onViewDetail={setShowDetail}
                onEdit={setEditing}
                onDelete={deleteDebtFromDatabase}
                permissions={permissions}
                currentUserEmail={currentUserEmail}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        {editing !== null && (
          <EditDebtModal
            initialData={editing}
            onClose={() => setEditing(null)}
            onSuccess={() => {
              setEditing(null);
              fetchDebts();
            }}
          />
        )}

        {showDetail && (
          <DebtDetailModal
            debt={showDetail}
            onClose={() => setShowDetail(null)}
          />
        )}
<ScannerModal
  isOpen={showScanner}
  onScan={handleScanSuccess}
  onClose={closeScanner}
/>
     
      </div>
    </div>
  );
}