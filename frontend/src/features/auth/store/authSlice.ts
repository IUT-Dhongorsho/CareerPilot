import { create } from 'zustand';

import { persist } from 'zustand/middleware';
import type { AuthUser, AuthSession } from '../types';

interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  isSyncing: boolean;
  setAuth: (session: AuthSession | null) => void;
  setSyncing: (isSyncing: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: false,
      isSyncing: true, // Default to true so app waits on initial load
      setSyncing: (isSyncing) => set({ isSyncing }),
      setAuth: (session) => {
        if (session) {
          const simplifiedUser: AuthUser = {
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
      logout: () => set({ session: null, user: null }),
    }),
    { name: 'auth-storage' }
  )
);
