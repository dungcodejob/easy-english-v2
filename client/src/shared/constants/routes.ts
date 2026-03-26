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
    LIST: '/learning/topics',
    DETAIL: '/learning/topics/$topicId',
  },
  DICTIONARY: {
    SEARCH: '/dictionary',
    SENSE_DETAIL: '/dictionary/senses/$senseId',
  },
  LEARN: '/learning',
  LEARNING_STUDY: '/learning/study',
  FLASHCARDS: '/flashcards',
  STUDY: '/study',
  FLASHCARD_STATS: '/flashcards/stats',
  REVIEW: '/review',
  PROGRESS: '/progress',
  ACHIEVEMENTS: '/achievements',
  SETTINGS: '/settings',
} as const;
