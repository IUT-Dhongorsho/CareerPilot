import supabase from '../../../lib/supabase';
import { useAuthStore } from '../store/authSlice';
import axiosClient from '../../../lib/api/axiosClient';

export const signInWithOauth = async (selectedProvider: 'google' | 'github') => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: selectedProvider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
};

export const handleAuthCallback = async () => {
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

      // Enrich session with backend info
      const enrichedSession = {
        ...session,
        user: {
          ...session.user,
          hasUploadedCv: syncResponse?.payload?.hasUploadedCv || syncResponse?.hasUploadedCv || false,
        }
      };

      // Store in Auth Store
      useAuthStore.getState().setAuth(enrichedSession);
      return enrichedSession;
    } catch (syncError) {
      console.error('Backend sync failed:', syncError);
      // Still set auth if sync fails? Usually better to have at least Supabase session
      useAuthStore.getState().setAuth(session);
      return session;
    }
  }
  
  return null;
};
