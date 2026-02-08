import { api, type ApiSuccessResponse } from '@/core/api';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../types/auth.types';

export const authApi = {
  login: async (
    data: LoginRequest,
  ): Promise<ApiSuccessResponse<LoginResponse>> => {
    return api.post('/auth/login', data);
  },

  register: async (
    data: RegisterRequest,
  ): Promise<ApiSuccessResponse<RegisterResponse>> => {
    return api.post('/auth/register', data);
  },
};
