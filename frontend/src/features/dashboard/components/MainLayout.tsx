import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { usePushNotifications } from '../../notifications/hooks/usePushNotifications';

export default function MainLayout() {
  const { requestPermissionAndSubscribe, permission, isSubscribed } = usePushNotifications();

  useEffect(() => {
    // Optionally automatically request or show a banner. 
    // Browsers often require a user gesture (like a button click) to show the prompt, 
    // but if it's already granted, usePushNotifications automatically subscribes.
    if (permission === 'default') {
      // For now, we can try to request it on mount (might be blocked by browser without gesture)
      // requestPermissionAndSubscribe();
    }
  }, [permission]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        {permission === 'default' && (
          <div className="bg-blue-100 text-blue-800 px-4 py-2 flex justify-between items-center">
            <span>Enable notifications to get real-time updates on your job applications.</span>
            <button 
              onClick={requestPermissionAndSubscribe}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
            >
              Enable
            </button>
          </div>
        )}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
