import { useEffect, useState } from 'react';

function readOnlineStatus() {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(readOnlineStatus);

  useEffect(() => {
    function updateOnlineStatus() {
      setIsOnline(readOnlineStatus());
    }

    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return isOnline;
}
