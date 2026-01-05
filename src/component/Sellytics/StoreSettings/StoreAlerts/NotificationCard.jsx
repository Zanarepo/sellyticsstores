// src/component/Sellytics/NotificationSettings/NotificationCard.jsx
import { Bell, Save } from 'lucide-react';
import NotificationSwitch from './NotificationSwitch';

export default function NotificationCard({
  settings,
  onChange,
  onSave,
  onDelete,
  loading,
  hasSettings,
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
          <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Alert Notification Settings
          </h3>
          <p className="text-sm text-slate-500">
            Control how and when alerts are sent
          </p>
        </div>
      </div>

      {/* Switches */}
      <div className="space-y-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl">
        <NotificationSwitch
          label="Email Enabled"
          checked={settings.email_enabled}
          onChange={(v) => onChange('email_enabled', v)}
        />
        <NotificationSwitch
          label="Low Inventory Alerts"
          checked={settings.enable_low_stock}
          onChange={(v) => onChange('enable_low_stock', v)}
        />
        <NotificationSwitch
          label="Sales Summary"
          checked={settings.enable_sales_summary}
          onChange={(v) => onChange('enable_sales_summary', v)}
        />
        <NotificationSwitch
          label="Product Events"
          checked={settings.enable_product_events}
          onChange={(v) => onChange('enable_product_events', v)}
        />
        <NotificationSwitch
          label="Sales Events"
          checked={settings.enable_sales_events}
          onChange={(v) => onChange('enable_sales_events', v)}
        />
      </div>

      {/* Threshold */}
      <div>
        <label className="text-sm font-medium mb-1 block">
          Reorder Level Threshold
        </label>
        <input
          type="number"
          value={settings.reorder_level_threshold}
          onChange={(e) =>
            onChange('reorder_level_threshold', Number(e.target.value))
          }
          className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-900"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onSave}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </button>

    
      </div>
    </div>
  );
}
