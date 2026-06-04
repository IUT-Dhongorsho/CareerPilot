import { useAuthStore } from '../../auth/store/authSlice';
import { useCVStore } from '../../cv/store/cvSlice';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuthStore();
  const { resetCV } = useCVStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    resetCV();
    navigate('/login');
  };

  return (
    <header className="bg-surface border-b border-border px-6 py-3 flex justify-between items-center">
      <div className="text-sm text-text-muted">Welcome, {user?.email}</div>
      <button onClick={handleLogout} className="text-red-500 hover:text-red-700 text-sm">Logout</button>
    </header>
  );
}
