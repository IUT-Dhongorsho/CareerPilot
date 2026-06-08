import React, { createContext, useContext, useEffect } from 'react';
import supabase from '../../../lib/supabase';
import { useAuthStore } from '../store/authSlice';
import type { AuthSession } from '../types';

interface AuthContextType {
  // Add any additional context properties here if needed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setAuth } = useAuthStore();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth(session as unknown as AuthSession | null);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth(session as unknown as AuthSession | null);
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
