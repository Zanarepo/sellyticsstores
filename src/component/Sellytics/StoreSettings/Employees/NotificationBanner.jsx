export default function NotificationBanner({ notification }) {
  if (!notification) return null;

  const color =
    notification.type === 'error' ? 'text-red-600' : 'text-green-600';

  return (
    <div className={`mb-4 font-medium ${color}`}>
      {notification.message}
    </div>
  );
}
