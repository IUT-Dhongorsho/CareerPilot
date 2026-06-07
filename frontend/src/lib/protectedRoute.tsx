import { Navigate } from 'react-router-dom';
import { useCVStore } from '../features/cv/store/cvSlice';
import { useAuthStore } from '../features/auth/store/authSlice';

export function ProtectedRoute({ children, requireCV = true }: { children: React.ReactNode; requireCV?: boolean }) {
  const { user } = useAuthStore();
  const { isUploaded } = useCVStore();

  console.log('ProtectedRoute:', { user, isUploaded, requireCV });

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (requireCV && !isUploaded) {
    return <Navigate to="/upload-cv" replace />;
  }
  return <>{children}</>;
}
