import { ApiRequestError, type ApiSuccessResponse } from '@/core/api';
import { APP_ROUTES } from '@/shared/constants';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { authApi } from '../services/auth.api';
import type { RegisterRequest, RegisterResponse } from '../types/auth.types';

export const useRegister = () => {
  const navigate = useNavigate();
  return useMutation<
    ApiSuccessResponse<RegisterResponse>,
    ApiRequestError,
    RegisterRequest
  >({
    mutationFn: authApi.register,
    onSuccess: () => {
      navigate({ to: APP_ROUTES.AUTH.LOGIN });
    },
  });
};
