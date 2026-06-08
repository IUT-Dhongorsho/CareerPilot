import React, { createContext, useContext, useEffect } from 'react';
import supabase from '../../../lib/supabase';
import { useAuthStore } from '../store/authSlice';
import type { AuthSession } from '../types';
import apiClient from '../../../lib/api/axiosClient';

interface AuthContextType {
  // Add any additional context properties here if needed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setAuth, setSyncing } = useAuthStore();

  const syncWithBackend = async (session: any) => {
    setSyncing(true);
    if (!session) {
      setAuth(null);
      setSyncing(false);
      return;
    }

    try {
      // Get latest user info from our shadow DB
      const response: any = await apiClient.post('/auth/sync', {
        id: session.user.id,
        email: session.user.email,
        fullName: session.user.user_metadata?.full_name,
        avatarUrl: session.user.user_metadata?.avatar_url,
      });

      // Merge backend status (like hasUploadedCv) into the session before storing
      const enrichedSession: AuthSession = {
        ...session,
        user: {
          ...session.user,
          hasUploadedCv: response.payload?.hasUploadedCv,
        },
      };

      setAuth(enrichedSession);
    } catch (error) {
      console.error('Failed to sync with backend:', error);
      // Fallback to basic session if sync fails
      setAuth(session as unknown as AuthSession);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncWithBackend(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncWithBackend(session);
    });

    return () => subscription.unsubscribe();
  }, [setAuth]);

  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
