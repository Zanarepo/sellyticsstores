// components/staff/StaffTable.jsx
import React from 'react';
import { Mail, Store, Shield } from 'lucide-react';
import ActionMenu from './ActionMenu';

export default function StaffTable({
  users = [],
  userRoles = {},
  onEdit,
  onDelete,
}) {
  if (!users.length) {
    return (
      <div className="text-center py-10 text-slate-500">
        No staff members found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-900/40">
          <tr>
             <th className="px-6 py-4 text-left font-medium text-slate-600 dark:text-slate-300">
              Name
            </th>
            <th className="px-6 py-4 text-left font-medium text-slate-600 dark:text-slate-300">
              Email
            </th>
            <th className="px-6 py-4 text-left font-medium text-slate-600 dark:text-slate-300">
              Store
            </th>
            <th className="px-6 py-4 text-left font-medium text-slate-600 dark:text-slate-300">
              Role
            </th>
            <th className="px-6 py-4 text-right font-medium text-slate-600 dark:text-slate-300">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {users.map((user) => {
            const role = userRoles[user.id] || 'No role assigned';

            return (
              <tr
                key={user.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
              >
                {/* Staff */}
                 <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {user.full_name || 'Unknown'}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {user.email_address || 'Unknown'}
                    </span>
                  </div>
                </td>

                {/* Store */}
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    <span>{user.shop_name || 'N/A'}</span>
                  </div>
                </td>

                {/* Role */}
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span className="capitalize">{role}</span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <ActionMenu
                    onEdit={() => onEdit(user)}
                    onDelete={() => onDelete(user.id)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
