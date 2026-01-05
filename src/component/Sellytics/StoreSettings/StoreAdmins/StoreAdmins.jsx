// src/component/Sellytics/StoreAdmins/StoreAdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Search, Users } from 'lucide-react';
import { useStaffAccess } from './useStaffAccess';
import StaffCard from './StaffCard';
import StaffTable from './StaffTable';
import ViewToggle from './ViewToggle';
import EditStaffAccessModal from './EditStaffAccessModal';

export default function StoreAdminDashboard() {
  const {
    employees,
    loading,
    error,
    shopName,
    userRoles,
    userFeatures,
    handleRoleChange,
    handleFeatureToggle,
    saveChanges,
    deleteUser,
    availableFeatures,
    roleFeatureMap,
  } = useStaffAccess();

  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('card');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load saved view preference
  useEffect(() => {
    const saved = localStorage.getItem('staffViewPreference');
    if (saved === 'card' || saved === 'table') {
      setView(saved);
    }
  }, []);

  // Auto-sync role → features for selected user
  useEffect(() => {
    if (!selectedUser) return;

    const userId = selectedUser.id;
    const role = userRoles[userId];

    if (role && roleFeatureMap[role]) {
      const expectedFeatures = roleFeatureMap[role];

      expectedFeatures.forEach((feature) => {
        const currentUserFeatures = userFeatures[userId] || [];
        if (!currentUserFeatures.includes(feature)) {
          handleFeatureToggle(userId, feature);
        }
      });
    }
  }, [
    selectedUser,
    userRoles,
    roleFeatureMap,
    userFeatures,
    handleFeatureToggle,
  ]);
  
  const filtered = employees.filter(
    (emp) =>
      emp.email_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (userRoles[emp.id] || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async (userId) => {
    setIsSaving(true);
    try {
      await saveChanges(userId);
      setSelectedUser(null);
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Manage Staff Access
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Store: <span className="font-medium">{shopName}</span>
              </p>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by email or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full sm:w-80 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <ViewToggle view={view} setView={setView} />
            </div>
          </div>

          {/* Staff List */}
          {loading ? (
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 rounded-xl h-32 animate-pulse shadow-sm"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-20 h-20 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">
                {searchQuery ? 'No matching staff found' : 'No staff added yet'}
              </p>
            </div>
          ) : view === 'card' ? (
            <div className="space-y-6">
              {filtered.map((user) => (
                <StaffCard
                  key={user.id}
                  user={user}
                  userRoles={userRoles}
                  onEdit={() => setSelectedUser(user)}
                  onDelete={deleteUser}
                />
              ))}
            </div>
          ) : (
            <StaffTable
              users={filtered}
              userRoles={userRoles}
              onEdit={(user) => setSelectedUser(user)}
              onDelete={deleteUser}
            />
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <EditStaffAccessModal
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        currentRole={selectedUser ? userRoles[selectedUser.id] || '' : ''}
        currentFeatures={selectedUser ? userFeatures[selectedUser.id] || [] : []}
        availableFeatures={availableFeatures}
        roleFeatureMap={roleFeatureMap}
        onRoleChange={handleRoleChange}
        onFeatureToggle={handleFeatureToggle}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </>
  );
}
