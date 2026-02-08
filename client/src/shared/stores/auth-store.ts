import { create } from 'zustand';
import { setAccessToken } from '../../core/api/api.client';
import { type User } from '../../modules/auth/types/auth.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  actions: {
    login: (user: User, accessToken: string) => void;
    logout: () => void;
    setUser: (user: User | null) => void;
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  actions: {
    login: (user: User, accessToken: string) => {
      setAccessToken(accessToken);
      set({ user, isAuthenticated: true });
    },
    logout: () => {
      setAccessToken(null);
      set({ user: null, isAuthenticated: false });
    },
    setUser: (user: User | null) => {
      set({ user, isAuthenticated: !!user });
    },
  },
}));

export const useAuthActions = () => useAuthStore((state) => state.actions);
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
