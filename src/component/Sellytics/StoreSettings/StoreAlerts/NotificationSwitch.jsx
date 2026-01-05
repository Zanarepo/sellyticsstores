// src/component/Sellytics/NotificationSettings/NotificationSwitch.jsx
import { Switch } from '@headlessui/react';

export default function NotificationSwitch({ label, checked, onChange }) {
  return (
    <Switch.Group
      as="div"
      className="flex items-center justify-between"
    >
      <Switch.Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </Switch.Label>

      <Switch
        checked={checked}
        onChange={onChange}
        className={`${
          checked
            ? 'bg-indigo-600'
            : 'bg-slate-300 dark:bg-slate-600'
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500`}
      >
        <span
          className={`${
            checked ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </Switch>
    </Switch.Group>
  );
}
