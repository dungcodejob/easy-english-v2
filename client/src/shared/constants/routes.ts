export const APP_ROUTES = {
  ROOT: '/',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
  },
  ONBOARDING: {
    WORKSPACE: '/onboarding/workspace',
  },
  WORKSPACE: {
    NEW: '/workspace/new',
    LIST: '/workspace',
  },
  DASHBOARD: '/dashboard',
  TOPIC: {
    LIST: '/topic',
    DETAIL: '/topic/$topicId',
  },
  LEARN: 'learn',
  REVIEW: 'review',
  SETTINGS: 'settings',
} as const;
