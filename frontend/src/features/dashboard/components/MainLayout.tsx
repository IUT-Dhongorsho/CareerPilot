import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import FloatingChat from '../../../components/ui/FloatingChat';
import { usePushNotifications } from '../../notifications/hooks/usePushNotifications';
import { useNotificationSocket } from '../../notifications/hooks/useNotificationSocket';

export default function MainLayout() {
  const { requestPermissionAndSubscribe, permission } = usePushNotifications();
  useNotificationSocket();

  useEffect(() => {
    if (permission === 'default') {
      // requestPermissionAndSubscribe();
    }
  }, [permission]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        {permission === 'default' && (
          <div className="bg-indigo-100 text-indigo-800 px-4 py-2 flex justify-between items-center">
            <span>Enable notifications to get real-time updates on your job applications.</span>
            <button 
              onClick={requestPermissionAndSubscribe}
              className="bg-indigo-500 text-white px-3 py-1 rounded text-sm hover:bg-indigo-600"
            >
              Enable
            </button>
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <FloatingChat />
    </div>
  );
}
