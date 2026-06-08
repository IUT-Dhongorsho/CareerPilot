import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../../../lib/supabaseClient';
import axiosClient from '../../../lib/api/axiosClient';
import type { AuthUser, AuthSession } from '../types';

interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  isSyncing: boolean;
  setAuth: (session: any | null) => void;
  setSyncing: (isSyncing: boolean) => void;
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
      isSyncing: true, // Default to true so app waits on initial load
      setSyncing: (isSyncing) => set({ isSyncing }),
      setAuth: (session) => {
        if (session) {
          const simplifiedUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            name: (session.user as any).user_metadata?.full_name || (session.user as any).name,
            avatar_url: (session.user as any).user_metadata?.avatar_url || (session.user as any).avatar_url,
            hasUploadedCv: (session.user as any).hasUploadedCv || (session.user as any).user_metadata?.hasUploadedCv,
          };
          
          const simplifiedSession: AuthSession = {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at || 0,
            expires_in: session.expires_in,
            token_type: session.token_type,
            user: simplifiedUser,
          };

          set({ session: simplifiedSession, user: simplifiedUser, isLoading: false });
        } else {
          set({ session: null, user: null, isLoading: false });
        }
      },
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
          
          if (data.session) {
            get().setAuth(data.session);
          }
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
          
          if (data.session) {
            get().setAuth(data.session);
          }
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
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);
