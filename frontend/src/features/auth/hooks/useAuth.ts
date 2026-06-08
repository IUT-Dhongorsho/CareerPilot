import { useAuthStore } from '../store/authSlice';
import supabase from '../../../lib/supabase';

export const useAuth = () => {
  const { user, session, isLoading } = useAuthStore();

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    session,
    isLoading,
    logout,
    isAuthenticated: !!user,
  };
};
