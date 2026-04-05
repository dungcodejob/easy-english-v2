# API Layer

> API client configuration, interceptors, request/response models, and error handling.

---

## 1. API Client Architecture

The API client is built on **Axios** with a request interceptor for JWT injection and a response interceptor for envelope unwrapping and 401 handling.

```
client/src/core/api/
├── api.client.ts      # Axios instance + interceptors (main export)
├── api.model.ts        # ApiSuccessResponse, ApiError, ApiRequestError types
├── api.call.ts         # Typed call utilities
└── bare-api.ts        # Base URL and default config
```

### Bare API Configuration

```typescript
// File: client/src/core/api/bare-api.ts
const bareApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});
```

---

## 2. Request Interceptor

Every outgoing request automatically includes the JWT access token:

```typescript
// File: client/src/core/api/api.client.ts

api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken.token}`;
  }
  return config;
});
```

**Note:** The `accessToken` is read from the Zustand auth store (persisted in `localStorage`). No token is stored in `localStorage` directly — only via the auth store.

---

## 3. Response Interceptor — Envelope Unwrapping

The response interceptor handles the server's envelope format:

```typescript
// Success: unwrap the data field from the envelope
if (envelope.success === true) {
  return envelope as ApiSuccessResponse<unknown>;
}

// Error: throw structured ApiRequestError
if (envelope.success === false) {
  throw new ApiRequestError(envelope.error, envelope.correlationId);
}
```

---

## 4. Response Interceptor — 401 Token Refresh

When a request returns 401, the interceptor attempts to refresh the access token:

```typescript
// On 401 response
if (error.response?.status === 401) {
  // Prevent infinite retry loop with _retry flag
  if (!originalRequest._retry && shouldRetryOn401(originalRequest.url)) {
    originalRequest._retry = true;
    const newToken = await refreshAccessToken();
    if (newToken) {
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest); // Retry the original request
    }
  }
  // Refresh failed — clear auth state
  useAuthStore.getState().actions.clear();
}
```

The `shouldRetryOn401` function ensures only safe routes are retried (not login/register/refresh):

```typescript
// File: client/src/modules/auth/services/auth.api.ts
export function shouldRetryOn401(url?: string): boolean {
  const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/auth/refresh'];
  return !PUBLIC_ROUTES.some((route) => url?.includes(route));
}
```

---

## 5. API Response Types

```typescript
// File: client/src/core/api/api.model.ts

// Success envelope
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
  pagination?: {
    top: number;
    count?: number;
    hasMore: boolean;
    skip?: number;
    nextLink?: string;
  };
  correlationId?: string;
  timestamp?: string;
}

// Error envelope
interface ApiError {
  code: string;
  type: ErrorType;
  message: string;
  details?: { field: string; message: string; code?: string }[];
}

interface ApiErrorResponse {
  success: false;
  error: ApiError;
  correlationId: string;
  timestamp?: string;
}

// Error types
enum ErrorType {
  NETWORK = 'network',
  CLIENT = 'client',
  DOMAIN = 'domain',
  SYSTEM = 'system',
}
```

---

## 6. ApiRequestError

A structured error class that provides typed access to error information:

```typescript
// File: client/src/core/api/api.model.ts

class ApiRequestError extends Error {
  code: string;
  type: ErrorType;
  details?: { field: string; message: string }[];
  correlationId: string;

  // Helpers
  getFieldError(field: string): string | undefined;
  isClientError(): boolean;   // type === CLIENT (validation)
  isDomainError(): boolean;    // type === DOMAIN (business logic)
  isSystemError(): boolean;    // type === SYSTEM (server error)
}
```

Usage in hooks:

```typescript
// In a TanStack Query mutation
const { mutate, error } = useReviewCard();

if (error) {
  if (error.isDomainError() && error.code === 'CARD_NOT_FOUND') {
    showToast('This card no longer exists');
  }
  if (error.isClientError()) {
    const fieldError = error.getFieldError('rating');
    setError('rating', { message: fieldError });
  }
}
```

---

## 7. Service Layer Pattern

API calls are encapsulated in service modules. Never call `api` directly from components or hooks.

```
modules/<name>/services/
└── <name>.api.ts     # All API calls for this module
```

Example:

```typescript
// File: client/src/modules/auth/services/auth.api.ts

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await api.post('/auth/login', payload);
  return (response as ApiSuccessResponse<LoginResponse>).data;
}

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await api.post('/auth/refresh');
    const data = (response as ApiSuccessResponse<LoginResponse>).data;
    return data.accessToken.token;
  } catch {
    return null;
  }
}

export function shouldRetryOn401(url?: string): boolean {
  // Exclude auth routes to prevent infinite loops
  return !url?.includes('/auth/');
}
```

---

## 8. Environment Variables

```bash
# client/.env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

The API base URL is configured in `client/src/core/api/bare-api.ts`.

---

## 9. Related Documentation

- [Overview](./overview.md) — Folder structure
- [State Management](./state-management.md) — Auth store and TanStack Query
