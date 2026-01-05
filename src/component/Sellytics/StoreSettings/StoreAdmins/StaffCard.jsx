// components/staff/StaffCard.jsx
import React from 'react';
import { Mail, Store, Shield } from 'lucide-react';
import ActionMenu from './ActionMenu';

export default function StaffCard({
  user,
  userRoles,
  onEdit,
  onDelete,
}) {
  const currentRole = userRoles[user.id] || 'No role assigned';

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-6">
        {/* Left: User Info */}
        <div className="flex-1 flex items-start gap-4">
          <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Mail className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          </div>

          <div className="flex-1 min-w-0">
             <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
              {user.full_name || 'N/A'}
            </h3>

            <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
              {user.email_address || 'Unknown User'}
            </h3>

            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Store className="w-4 h-4" />
                <span className="truncate">{user.shop_name || 'N/A'}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Shield className="w-4 h-4" />
                <span className="capitalize">{currentRole}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Action Menu */}
        <div className="flex-shrink-0">
          <ActionMenu
            onEdit={onEdit}
            onDelete={() => onDelete(user.id)}
          />
        </div>
      </div>
    </div>
  );
}