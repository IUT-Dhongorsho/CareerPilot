import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleAuthCallback } from '../services/oauth';
import { useAuthStore } from '../store/authSlice';
import type { AuthSession } from '../types';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setSyncing } = useAuthStore();

  useEffect(() => {
    const processCallback = async () => {
      try {
        setSyncing(true);
        const session: AuthSession | null = await handleAuthCallback();
        
        if (session) {
          if (session.user.hasUploadedCv) {
            navigate('/dashboard');
          } else {
            navigate('/upload-cv');
          }
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth callback processing failed:', error);
        navigate('/login?error=auth_callback_failed');
      } finally {
        setSyncing(false);
      }
    };

    processCallback();
  }, [navigate, setSyncing]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Completing sign in...</h2>
        <p className="text-gray-500 mt-2">Please wait while we set up your session.</p>
      </div>
    </div>
  );
}
