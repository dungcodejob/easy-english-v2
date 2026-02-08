import type { TokenResultDto, UserResponseDto } from '@/modules/auth/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  user: UserResponseDto | null;
  accessToken: TokenResultDto | null;
  isAuthenticated: boolean;
  actions: {
    login: (user: UserResponseDto, accessToken: TokenResultDto) => void;
    logout: () => void;
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
        login: (user: UserResponseDto, accessToken: TokenResultDto) => {
          set({ user, accessToken: accessToken, isAuthenticated: true });
        },
        logout: () => {
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
