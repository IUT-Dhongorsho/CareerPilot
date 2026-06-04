import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: { id: string; email: string } | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      login: async (email, password) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));
        if (email && password) {
          set({ user: { id: 'mock-user-1', email }, isLoading: false });
        } else {
          set({ isLoading: false });
          throw new Error('Invalid credentials');
        }
      },
      signup: async (email, password) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));
        set({ user: { id: 'mock-user-1', email }, isLoading: false });
      },
      logout: () => set({ user: null }),
    }),
    { name: 'auth-storage' }
  )
);
