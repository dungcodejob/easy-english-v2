import axios from 'axios';
import type { ApiResponseEnvelope } from './api.model';

export const api = axios.create({
  baseURL: import.meta.env.PUBLIC_API_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResponseEnvelope<unknown>;

    // Unwrap the response if it follows the standard envelope structure
    if (
      data &&
      typeof data === 'object' &&
      'success' in data &&
      data.success === true
    ) {
      return data;
    }

    return data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Here we could implement refresh token logic if manual refresh was needed,
      // but since refresh token is httpOnly cookie, the browser handles it.
      // However, if the access token expired, we might need to call a refresh endpoint.
      // BUT current implementation plan: Access Token in memory.
      // If 401, it means Access Token expired OR is missing/invalid.
      // Since we don't have a silent refresh implemented yet in frontend (T045 says NO refresh token storage in frontend),
      // we rely on the user logging in again or a separate refresh mechanism.
      // For now, we'll just reject to let the UI redirect to login.
      // OR if we want to support silent refresh, we'd catch 401, call /refresh (with cookie), get new AT, retry.
      // T046 says "Keep 401 redirect to login logic". So we just let it fail.
    }
    return Promise.reject(error);
  },
);
