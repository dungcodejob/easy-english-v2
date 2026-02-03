import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { AuthApi } from '../services/auth.api';
import type {
  AuthError,
  RegisterRequest,
  RegisterResponse,
} from '../types/auth.types';

export const useRegister = () => {
  return useMutation<RegisterResponse, AxiosError<AuthError>, RegisterRequest>({
    mutationFn: AuthApi.register,
  });
};
