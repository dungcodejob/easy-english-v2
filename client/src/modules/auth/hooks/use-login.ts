import { useMutation } from '@tanstack/react-query';
import { useAuthActions } from '../../../shared/stores/auth-store';
import { authApi } from '../services/auth.api';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

export const useLogin = () => {
  const { login } = useAuthActions();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data: LoginResponse) => {
      login(data.user, data.accessToken);
    },
  });
};
