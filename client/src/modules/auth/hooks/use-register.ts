import { APP_ROUTES } from '@/shared/constants';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import { authApi } from '../services/auth.api';
import type {
  AuthError,
  RegisterRequest,
  RegisterResponse,
} from '../types/auth.types';

export const useRegister = () => {
  const navigate = useNavigate();
  return useMutation<RegisterResponse, AxiosError<AuthError>, RegisterRequest>({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      navigate({ to: APP_ROUTES.AUTH.LOGIN });
    },
  });
};
