import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authSlice';
import { useCVStore } from '../features/cv/store/cvSlice';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export function ProtectedRoute({ children, requireCV = true }: { children: React.ReactNode; requireCV?: boolean }) {
  const { user, isSyncing } = useAuthStore();
  const { isUploaded } = useCVStore();
  const location = useLocation();

  if (isSyncing) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg text-text">
        <LoadingSpinner />
      </div>
    );
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
    return <Navigate to={isUploaded ? "/dashboard" : "/upload-cv"} replace />;
  }

  // 3. CV Requirement Check
  
  // If user HAS NOT uploaded CV and tries to access dashboard
  if (requireCV && !isUploaded && !isUploadPage) {
    return <Navigate to="/upload-cv" replace />;
  }

  return <>{children}</>;
}
