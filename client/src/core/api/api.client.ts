import axios from 'axios';
import { useAuthStore } from '../../shared/stores/auth-store';
import {
  ApiRequestError,
  type ApiErrorResponse,
  type ApiResponseEnvelope,
  type ApiSuccessResponse,
} from './api.model';

export const api = axios.create({
  baseURL: import.meta.env.PUBLIC_API_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    const envelope = response.data as ApiResponseEnvelope<unknown>;

    // Check if response follows the envelope format
    if (envelope && typeof envelope === 'object' && 'success' in envelope) {
      if (envelope.success === false) {
        // Business logic error from server (validation, domain errors, etc.)
        throw new ApiRequestError(envelope.error, envelope.correlationId);
      }
      // Success - return the success envelope
      // Hooks can access data, meta, pagination from this
      return envelope as ApiSuccessResponse<unknown>;
    }

    // Non-envelope response (fallback for legacy endpoints)
    return response.data;
  },
  async (error) => {
    // HTTP error (network errors, 4xx, 5xx status codes)
    const envelope = error.response?.data as ApiErrorResponse | undefined;

    // Check if error response follows envelope format
    if (envelope && envelope.success === false) {
      throw new ApiRequestError(envelope.error, envelope.correlationId);
    }

    // Handle 401 - Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      // Clear access token and let UI redirect to login
      useAuthStore.getState().actions.logout();
    }

    return Promise.reject(error);
  },
);
