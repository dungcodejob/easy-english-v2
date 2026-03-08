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
  DICTIONARY: {
    SEARCH: '/dictionary',
    SENSE_DETAIL: '/dictionary/senses/$senseId',
  },
  LEARN: '/learning',
  REVIEW: '/review',
  PROGRESS: '/progress',
  ACHIEVEMENTS: '/achievements',
  SETTINGS: '/settings',
} as const;
