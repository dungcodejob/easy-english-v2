import { api, apiCall, type ApiSuccessResponse } from '@/core/api';

// ── Types ────────────────────────────────────────────────────────────────────
export interface Topic {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TopicWord {
  id: string;
  wordSenseId: string;
  status: string;
  addedAt: string;
  // denormalised word info returned along with the entry
  wordText?: string;
  definition?: string;
  partOfSpeech?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    top: number;
    skip: number;
    count: number;
    hasMore: boolean;
  };
}

// ── API ──────────────────────────────────────────────────────────────────────
export const TopicApi = {
  /** Paginated list of topics owned by the current user. */
  getTopics: (top = 20, skip = 0) =>
    apiCall(() =>
      api.get<unknown, ApiSuccessResponse<PaginatedResponse<Topic>>>(
        '/topics',
        { params: { $top: top, $skip: skip } },
      ),
    ),

  /** Get single topic details. */
  getTopicDetail: (id: string) =>
    apiCall(() => api.get<unknown, ApiSuccessResponse<Topic>>(`/topics/${id}`)),

  /** Create a new topic. */
  createTopic: (name: string, description?: string) =>
    apiCall(() =>
      api.post<unknown, ApiSuccessResponse<Topic>>('/topics', {
        name,
        description,
      }),
    ),

  /** Paginated list of words inside a topic. */
  getTopicWords: (topicId: string, top = 20, skip = 0) =>
    apiCall(() =>
      api.get<unknown, ApiSuccessResponse<PaginatedResponse<TopicWord>>>(
        `/topics/${topicId}/words`,
        { params: { $top: top, $skip: skip } },
      ),
    ),

  /** Add a word sense to a topic. */
  addWord: (topicId: string, wordSenseId: string) =>
    apiCall(() =>
      api.post<unknown, ApiSuccessResponse<TopicWord>>(
        `/topics/${topicId}/words`,
        { wordSenseId },
      ),
    ),

  /** Remove a word from a topic. */
  removeWord: (topicId: string, wordId: string) =>
    apiCall(() =>
      api.delete<unknown, ApiSuccessResponse<null>>(
        `/topics/${topicId}/words/${wordId}`,
      ),
    ),
};
