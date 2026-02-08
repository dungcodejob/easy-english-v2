import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { type User } from '../../modules/auth/types/auth.types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  actions: {
    login: (user: User, accessToken: string) => void;
    logout: () => void;
    setUser: (user: User | null) => void;
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      actions: {
        login: (user: User, accessToken: string) => {
          set({ user, accessToken, isAuthenticated: true });
        },
        logout: () => {
          set({ user: null, accessToken: null, isAuthenticated: false });
        },
        setUser: (user: User | null) => {
          set({ user, isAuthenticated: !!user });
        },
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export const useAuthActions = () => useAuthStore((state) => state.actions);
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
