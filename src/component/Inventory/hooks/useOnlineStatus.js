import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const online = () => {
      setIsOnline(true);
      toast.success('Back online!', { icon: '🌐' });
    };

    const offline = () => {
      setIsOnline(false);
      toast('Working offline', { icon: '📴' });
    };

    window.addEventListener('online', online);
    window.addEventListener('offline', offline);

    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  return isOnline;
}
