import { useEffect } from 'react';
import { useNotificationStore } from '../store/notificationSlice';

export const useNotifications = () => {
  const { fetchNotifications } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);
};
