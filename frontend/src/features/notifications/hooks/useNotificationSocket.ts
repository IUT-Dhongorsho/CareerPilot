import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../auth/store/authSlice';
import { useNotificationStore, Notification } from '../store/notificationSlice';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const useNotificationSocket = () => {
  const { session } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!session?.access_token) return;

    const socket: Socket = io(SOCKET_URL, {
      auth: {
        token: session.access_token,
      },
      transports: ['websocket'],
    });

    socket.on('notification:new', (notification: Notification) => {
      addNotification(notification);
      toast.info(notification.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    });

    socket.on('connect_error', (error) => {
      console.error('Notification socket connection error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, [session, addNotification]);
};
