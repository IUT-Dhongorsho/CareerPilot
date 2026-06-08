import { useEffect } from 'react';
import { useNotificationStore } from '../store/notificationSlice';
import { getNotificationsReal } from '../services/realNotificationsApi';

export const useNotificationPolling = () => {
  const { fetchNotifications } = useNotificationStore();

  useEffect(() => {
    // Fetch immediately
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);
};
