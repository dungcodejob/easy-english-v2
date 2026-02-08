import { api, type ApiSuccessResponse } from '@/core/api';
import type { LoginResponseDto } from '../types';
import type {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
} from '../types/auth.types';

export const authApi = {
  login: async (
    data: LoginRequest,
  ): Promise<ApiSuccessResponse<LoginResponseDto>> => {
    return api.post('/auth/login', data);
  },

  register: async (
    data: RegisterRequest,
  ): Promise<ApiSuccessResponse<RegisterResponse>> => {
    return api.post('/auth/register', data);
  },
};
