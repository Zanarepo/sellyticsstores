// src/component/Sellytics/StoreAdmins/EditStaffAccessModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Shield } from 'lucide-react';

export default function EditStaffAccessModal({
  user,
  isOpen,
  onClose,
  currentRole = '',
  currentFeatures = [],
  availableFeatures = [],
  roleFeatureMap = {},
  onRoleChange,
  onFeatureToggle,
  onSave,
  isSaving = false,
}) {
  if (!isOpen || !user) return null;

  const safeFeatures = Array.isArray(currentFeatures) ? currentFeatures : [];
  const safeAvailable = Array.isArray(availableFeatures) ? availableFeatures : [];
  const safeRoleMap =
    typeof roleFeatureMap === 'object' && roleFeatureMap !== null
      ? roleFeatureMap
      : {};

  const handleSubmit = async () => {
    await onSave(user.id);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="
            bg-white dark:bg-slate-800 rounded-2xl shadow-2xl
            w-full max-w-4xl h-[90vh] max-h-[90vh]
            flex flex-col
          "
        >
          {/* ================= HEADER (FIXED) ================= */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Edit Staff Access
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {user.email_address || 'Unknown'} • {user.shop_name || 'N/A'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* ================= CONTENT (SCROLLABLE) ================= */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* ROLE CARD */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
              <label className="block text-sm font-medium">
                Assign Role
              </label>

              <select
                value={currentRole}
                onChange={(e) => onRoleChange(user.id, e.target.value)}
                className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">No Role</option>
                {Object.keys(safeRoleMap).map((role) => (
                  <option key={role} value={role}>
                    {role.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>

              {currentRole && (
                <p className="text-xs text-slate-500">
                  Role features are prefilled but can be overridden.
                </p>
              )}
            </div>

            {/* FEATURES CARD */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
              <label className="block text-sm font-medium">
                Feature Access
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                {safeAvailable.map((feature) => (
                  <label
                    key={feature}
                    className="
                      flex items-center gap-3 p-3 rounded-lg cursor-pointer
                      bg-white dark:bg-slate-800
                      hover:bg-slate-100 dark:hover:bg-slate-700
                      transition
                    "
                  >
                    <input
                      type="checkbox"
                      checked={safeFeatures.includes(feature)}
                      onChange={() => onFeatureToggle(user.id, feature)}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium">
                      {feature}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ================= FOOTER (FIXED) ================= */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-3 justify-end flex-shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="
                flex items-center justify-center gap-2
                px-6 py-3 rounded-xl
                bg-indigo-600 hover:bg-indigo-700
                text-white font-semibold
                transition disabled:opacity-50
              "
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
