import { ApiRequestError, type ApiSuccessResponse } from '@/core/api';
import { useMutation } from '@tanstack/react-query';
import { useAuthActions } from '../../../shared/stores/auth-store';
import { authApi } from '../services/auth.api';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

export const useLogin = () => {
  const { login } = useAuthActions();

  return useMutation<
    ApiSuccessResponse<LoginResponse>,
    ApiRequestError,
    LoginRequest
  >({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      if (response.data) {
        login(response.data.user, response.data.accessToken);
      }
    },
  });
};
