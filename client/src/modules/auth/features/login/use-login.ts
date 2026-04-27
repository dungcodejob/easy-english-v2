import { ApiRequestError, type ApiSuccessResponse } from '@/core/api';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthActions } from '@/shared/stores/auth-store';
import { authApi } from '../../services/auth.api';
import type { LoginResponseDto, LoginRequest } from '../../services/auth.types';

export const useLogin = () => {
  const { setToken, setUser } = useAuthActions();

  const mutation = useMutation<
    ApiSuccessResponse<LoginResponseDto>,
    ApiRequestError,
    LoginRequest
  >({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      if (response.data) {
        setUser(response.data.user);
        setToken(response.data.accessToken);
      }
    },
  });

  return {
    ...mutation,
    mutateAsync: (data: LoginRequest) =>
      toast.promise(mutation.mutateAsync(data), {
        loading: 'Logging in...',
        success: 'Logged in successfully!',
        error: (error: ApiRequestError) => error.message || 'Failed to log in.',
      }),
  };
};
