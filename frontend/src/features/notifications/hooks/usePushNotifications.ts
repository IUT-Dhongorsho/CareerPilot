import { useState, useEffect } from 'react';
import apiClient from '../../../lib/api/axiosClient';
import { useAuth } from '../../auth/hooks/useAuth';

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const usePushNotifications = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    // Automatically try to subscribe if permission was already granted and user is authenticated
    if (isAuthenticated && permission === 'granted' && !isSubscribed) {
      subscribeToPush();
    }
  }, [isAuthenticated, permission]);

  const requestPermissionAndSubscribe = async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notification');
      return;
    }

    const currentPermission = await Notification.requestPermission();
    setPermission(currentPermission);

    if (currentPermission === 'granted') {
      await subscribeToPush();
    } else {
      console.warn('Notification permission denied');
    }
  };

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging is not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully');

      // Wait for SW to be active
      await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const vapidPublicKey = import.meta.env.VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          throw new Error('VAPID_PUBLIC_KEY is not defined');
        }

        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      }

      // Send the subscription to the backend
      await apiClient.post('/notifications/subscribe', {
        subscription,
      });

      setIsSubscribed(true);
      console.log('Push subscription successful');
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  };

  return {
    isSubscribed,
    permission,
    requestPermissionAndSubscribe,
  };
};
