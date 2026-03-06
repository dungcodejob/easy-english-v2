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

// Define which route prefixes should use the envelope error parsing
// const ENVELOPE_ROUTES = ['/dictionary', '/learning', '/workspace', '/topic'];

function shouldUseEnvelope(url?: string, baseURL?: string): boolean {
  if (!url) return false;

  // Axios will combine baseURL and url.
  // If the url is absolute and doesn't start with our baseURL, it's an external API.
  if (url.startsWith('http')) {
    const apiBase = baseURL || api.defaults.baseURL || '';
    if (apiBase && !url.startsWith(apiBase)) {
      return false; // External API
    }
  }

  // Bỏ qua query params nếu có
  // const path = url.startsWith('http')
  //   ? new URL(url).pathname
  //   : url.split('?')[0];

  // Check if it's one of our internal routes that uses the envelope
  // return ENVELOPE_ROUTES.some((route) => path.startsWith(route));
  return true;
}

api.interceptors.response.use(
  (response) => {
    const isEnvelopeApi = shouldUseEnvelope(
      response.config.url,
      response.config.baseURL,
    );
    const envelope = response.data as ApiResponseEnvelope<unknown>;

    // Check if response follows the envelope format AND it matches our URL whitelist
    if (
      isEnvelopeApi &&
      envelope &&
      typeof envelope === 'object' &&
      'success' in envelope
    ) {
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
    const isEnvelopeApi = shouldUseEnvelope(error.config?.url);
    const envelope = error.response?.data as ApiErrorResponse | undefined;

    // Check if error response follows envelope format AND it matches our URL whitelist
    if (isEnvelopeApi && envelope && envelope.success === false) {
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
