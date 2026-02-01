export const QUERY_KEYS = {
  AUTH: {
    LOGIN: 'auth-login',
    LOGOUT: 'auth-logout',
    REGISTER: 'auth-register',
  },
  WORKSPACE: 'workspace',
  TOPIC: 'topic',
  WORD: 'word',
} as const;

export const API_KEYS = {
  TOPIC: 'topic',
  WORD: 'word',
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
} as const;
