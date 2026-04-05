import { ApiRequestError, type ApiSuccessResponse } from '@/core/api';

import { AuthRoutes } from '@/shared/constants';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { authApi } from '../services/auth.api';
import type { RegisterRequest, RegisterResponse } from '../types/auth.types';

export const useRegister = () => {
  const navigate = useNavigate();
  const mutation = useMutation<
    ApiSuccessResponse<RegisterResponse>,
    ApiRequestError,
    RegisterRequest
  >({
    mutationFn: authApi.register,
    onSuccess: () => {
      navigate({ to: AuthRoutes.login() });
    },
  });

  return {
    ...mutation,
    mutateAsync: (data: RegisterRequest) =>
      toast.promise(mutation.mutateAsync(data), {
        loading: 'Registering...',
        success: 'Registered successfully!',
        error: (error: ApiRequestError) =>
          error.message || 'Failed to register.',
      }),
  };
};
