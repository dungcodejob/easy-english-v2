import { api, type ApiSuccessResponse } from '@/core/api';
import { bareApi } from '@/core/api/bare-api';
import { useAuthStore } from '@/shared/stores/auth-store';
import type { LoginResponseDto } from '../types';
import type {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
} from '../types/auth.types';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

export const AUTH_EXCLUDED_URLS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
];

export const shouldRetryOn401 = (url?: string): boolean => {
  if (!url) return false;
  return !AUTH_EXCLUDED_URLS.some((excluded) => url.includes(excluded));
};

export const refreshAccessToken = async (): Promise<string | null> => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const response =
      await bareApi.post<ApiSuccessResponse<LoginResponseDto>>('/auth/refresh');

    // Check if envelope format is valid and success is true
    if (response.data && response.data.success && response.data.data) {
      const { accessToken, user } = response.data.data;

      const { setToken, setUser } = useAuthStore.getState().actions;

      setUser(user); // Important to ensure user is up to date (this handles updating state if changed)
      setToken(accessToken);

      processQueue(null, accessToken.token);
      return accessToken.token;
    }

    throw new Error('Invalid refresh response');
  } catch (error) {
    processQueue(error, null);

    // Always logout on failed refresh
    useAuthStore.getState().actions.clear();

    return null;
  } finally {
    isRefreshing = false;
  }
};

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
