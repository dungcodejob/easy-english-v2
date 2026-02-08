// ============================================================================
// Query Key Factories (TanStack Query Best Practice)
// ============================================================================

export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
};

export const workspaceKeys = {
  all: ['workspace'] as const,
  lists: () => [...workspaceKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...workspaceKeys.lists(), filters] as const,
  details: () => [...workspaceKeys.all, 'detail'] as const,
  detail: (id: string) => [...workspaceKeys.details(), id] as const,
  hasWorkspace: () => [...workspaceKeys.all, 'has'] as const,
};

export const topicKeys = {
  all: ['topic'] as const,
  lists: () => [...topicKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...topicKeys.lists(), filters] as const,
  details: () => [...topicKeys.all, 'detail'] as const,
  detail: (id: string) => [...topicKeys.details(), id] as const,
  byWorkspace: (workspaceId: string) =>
    [...topicKeys.all, 'workspace', workspaceId] as const,
};

export const wordKeys = {
  all: ['word'] as const,
  lists: () => [...wordKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...wordKeys.lists(), filters] as const,
  details: () => [...wordKeys.all, 'detail'] as const,
  detail: (id: string) => [...wordKeys.details(), id] as const,
  byTopic: (topicId: string) => [...wordKeys.all, 'topic', topicId] as const,
};

export const API_KEYS = {
  TOPIC: 'topic',
  WORD: 'word',
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
} as const;
