// components/staff/StaffCard.jsx
import React from 'react';
import { Mail, Store, Shield } from 'lucide-react';
import ActionMenu from './ActionMenu';

export default function StaffCard({ user, userRoles, onEdit, onDelete }) {
  const currentRole = userRoles[user.id] || 'No role assigned';

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
        {/* User Info */}
        <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full min-w-0">
          {/* Avatar */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
            <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600 dark:text-indigo-400" />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
              {user.full_name || 'N/A'}
            </h3>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 truncate mt-0.5">
              {user.email_address || 'Unknown User'}
            </p>

            <div className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{user.shop_name || 'N/A'}</span>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="capitalize truncate">{currentRole}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Menu */}
        <div className="flex-shrink-0 self-start sm:self-auto ml-auto sm:ml-0">
          <ActionMenu
            onEdit={onEdit}
            onDelete={() => onDelete(user.id)}
          />
        </div>
      </div>
    </div>
  );
}