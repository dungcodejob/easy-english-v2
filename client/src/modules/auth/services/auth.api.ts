import { api, type ApiResponseEnvelope } from '@/core/api';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../types/auth.types';

export const authApi = {
  login: async (
    data: LoginRequest,
  ): Promise<ApiResponseEnvelope<LoginResponse>> => {
    return api.post('/auth/login', data);
  },

  register: async (
    data: RegisterRequest,
  ): Promise<ApiResponseEnvelope<RegisterResponse>> => {
    return api.post('/auth/register', data);
  },
};
