import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../../auth/store/authSlice';
import { useCVStore } from '../../cv/store/cvSlice';

export default function Header() {
  const { user, logout } = useAuthStore();
  const { resetCV } = useCVStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    resetCV();
    window.location.href = '/login';
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-5 flex justify-between items-center shadow-sm">
      <h2 className="text-xl font-semibold text-gray-700">Welcome back, {user?.email?.split('@')[0] || 'User'}</h2>
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative" ref={notificationRef} style={{ zIndex: 1000 }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full hover:bg-gray-100 transition relative"
          >
            <Bell size={24} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
              <div className="p-3 border-b border-gray-100 font-semibold text-base">Notifications</div>
              <div className="p-3 text-sm text-gray-500">No new notifications</div>
            </div>
          )}
        </div>
        {/* User Menu */}
        <div className="relative" ref={userMenuRef} style={{ zIndex: 1000 }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg">
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
          </button>
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
              <Link
                to="/dashboard/profile"
                className="flex items-center gap-2 px-4 py-2 text-base text-gray-700 hover:bg-gray-50"
                onClick={() => setShowUserMenu(false)}
              >
                <User size={18} /> Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-base text-red-600 hover:bg-gray-50 w-full text-left"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
