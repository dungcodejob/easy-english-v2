import type {
  TokenResultDto,
  UserResponseDto,
} from '@/modules/auth/services/auth.types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  user: UserResponseDto | null;
  accessToken: TokenResultDto | null;
  isAuthenticated: boolean;
  actions: {
    setToken: (accessToken: TokenResultDto) => void;
    clear: () => void;
    setUser: (user: UserResponseDto | null) => void;
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      actions: {
        setToken: (accessToken: TokenResultDto) => {
          set({ accessToken: accessToken, isAuthenticated: true });
        },
        clear: () => {
          set({ user: null, accessToken: null, isAuthenticated: false });
        },
        setUser: (user: UserResponseDto | null) => {
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
