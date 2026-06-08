import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../../../lib/supabaseClient';
import axiosClient from '../../../lib/api/axiosClient';

interface AuthState {
  user: { id: string; email: string; fullName?: string } | null;
  session: any | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw new Error(error.message);
          // Sync user with backend
          await axiosClient.post('/auth/sync', {
            id: data.user.id,
            email: data.user.email,
            fullName: data.user.user_metadata?.full_name,
          });
          set({
            user: { id: data.user.id, email: data.user.email!, fullName: data.user.user_metadata?.full_name },
            session: data.session,
            isLoading: false,
          });
        } catch (err: any) {
          set({ isLoading: false });
          throw err;
        }
      },
      signup: async (email, password, fullName) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
          });
          if (error) throw new Error(error.message);
          // Sync with backend
          await axiosClient.post('/auth/sync', {
            id: data.user!.id,
            email: data.user!.email,
            fullName,
          });
          set({
            user: { id: data.user!.id, email: data.user!.email!, fullName },
            session: data.session,
            isLoading: false,
          });
        } catch (err: any) {
          set({ isLoading: false });
          throw err;
        }
      },
      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null, isLoading: false });
      },
    }),
    {
      name: 'auth-storage',
      // Clear persisted state if it's causing issues (optional)
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Reset isLoading to false on rehydrate
          state.isLoading = false;
        }
      },
    }
  )
);
