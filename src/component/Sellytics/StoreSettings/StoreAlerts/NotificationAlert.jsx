// src/component/Sellytics/NotificationSettings/NotificationSettings.jsx
import NotificationCard from './NotificationCard';
import { useNotificationSettings } from './useNotificationSettings';
import toast from 'react-hot-toast';
export default function NotificationSettings() {
  const {
    settings,
    update,
    save,
    remove,
    loading,
    hasSettings,
  } = useNotificationSettings();

  const handleSave = async () => {
    const error = await save();
    if (!error) toast.success('Settings saved');
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete notification settings?')) return;
    const error = await remove();
    if (!error) alert('Settings deleted');
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <NotificationCard
        settings={settings}
        onChange={update}
        onSave={handleSave}
        onDelete={handleDelete}
        loading={loading}
        hasSettings={hasSettings}
      />
    </div>
  );
}
