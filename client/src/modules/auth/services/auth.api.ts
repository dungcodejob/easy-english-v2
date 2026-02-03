import { api } from '@/shared/lib/api';
import type { RegisterRequest, RegisterResponse } from '../types/auth.types';

export const AuthApi = {
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    return api.post('/auth/register', data);
  },
};
