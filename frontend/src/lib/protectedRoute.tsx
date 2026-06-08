import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authSlice';

export function ProtectedRoute({ children, requireCV = true }: { children: React.ReactNode; requireCV?: boolean }) {
  const { user, isSyncing } = useAuthStore();
  const location = useLocation();

  if (isSyncing) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isUploadPage = location.pathname === '/upload-cv';

  // 1. Not logged in
  if (!user) {
    // If trying to access protected content, go to login
    if (!isAuthPage) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    // Allow login/signup
    return <>{children}</>;
  }

  // 2. Logged in
  
  // If user is logged in and tries to access login/signup
  if (isAuthPage) {
    return <Navigate to={user.hasUploadedCv ? "/dashboard" : "/upload-cv"} replace />;
  }

  // 3. CV Requirement Check
  
  // If user HAS NOT uploaded CV and tries to access dashboard
  if (!user.hasUploadedCv && !isUploadPage) {
    return <Navigate to="/upload-cv" replace />;
  }

  // If user HAS uploaded CV and tries to access upload page (unless we want to allow re-upload)
  // For now, let's allow accessing upload-cv even if they have one, to support "replacement"
  
  return <>{children}</>;
}
