import supabase from '../../../lib/supabase';
import { useAuthStore } from '../store/authSlice';
import axiosClient from '../../../lib/api/axiosClient';
import type { AuthSession } from '../types';

export const signInWithOauth = async (selectedProvider: 'google' | 'github') => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: selectedProvider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
};

export const handleAuthCallback = async (): Promise<AuthSession | null> => {
  // Supabase automatically parses the hash fragment and sets the session
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error during auth callback:', error.message);
    throw error;
  }

  if (session) {
    try {
      // Sync user with backend
      const syncResponse: any = await axiosClient.post('/auth/sync', {
        id: session.user.id,
        email: session.user.email,
        fullName: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
      });

      // Enrich user with backend info
      const hasUploadedCv = syncResponse?.payload?.hasUploadedCv || syncResponse?.hasUploadedCv || false;

      // Store in Auth Store using setAuth which handles simplification
      useAuthStore.getState().setAuth({
        ...session,
        user: {
          ...session.user,
          hasUploadedCv
        }
      });
      
      // Get the simplified session from store to return consistent types
      return useAuthStore.getState().session;
    } catch (syncError) {
      console.error('Backend sync failed:', syncError);
      // Still set auth if sync fails? Usually better to have at least Supabase session
      useAuthStore.getState().setAuth(session);
      return useAuthStore.getState().session;
    }
  }
  
  return null;
};
