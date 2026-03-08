import { api, apiCall, type ApiSuccessResponse } from '@/core/api';

export interface Topic {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TopicWord {
  id: string;
  topicId: string;
  wordSenseId: string;
  status: 'NEW' | 'LEARNING' | 'MASTERED';
  addedAt: string;
}

// Removed PaginatedResponse, using ApiSuccessResponse instead

export interface CreateTopicDto {
  name: string;
  description?: string;
}

export interface UpdateTopicDto {
  name?: string;
  description?: string;
}

export interface AddTopicWordDto {
  wordSenseId: string;
}

export const topicApi = {
  createTopic: async (data: CreateTopicDto) => {
    const response = await api.post<Topic>('/api/v1/topics', data);
    return response.data;
  },

  listTopics: async (top = 20, skip = 0) => {
    const result = await apiCall(() =>
      api.get<unknown, ApiSuccessResponse<Topic[]>>('/api/v1/topics', {
        params: { $top: top, $skip: skip },
      }),
    );
    return result;
  },

  getTopic: async (id: string) => {
    const result = await apiCall(() =>
      api.get<unknown, ApiSuccessResponse<Topic>>(`/api/v1/topics/${id}`),
    );
    return result.data;
  },

  updateTopic: async (id: string, data: UpdateTopicDto) => {
    const response = await api.patch<Topic>(`/api/v1/topics/${id}`, data);
    return response.data;
  },

  deleteTopic: async (id: string) => {
    const response = await api.delete(`/api/v1/topics/${id}`);
    return response.data;
  },

  addWordToTopic: async (topicId: string, data: AddTopicWordDto) => {
    const response = await api.post<TopicWord>(
      `/api/v1/topics/${topicId}/words`,
      data,
    );
    return response.data;
  },

  listTopicWords: async (topicId: string, top = 20, skip = 0) => {
    const result = await apiCall(() =>
      api.get<unknown, ApiSuccessResponse<TopicWord[]>>(
        `/api/v1/topics/${topicId}/words`,
        {
          params: { $top: top, $skip: skip },
        },
      ),
    );
    return result;
  },

  removeWordFromTopic: async (topicId: string, wordSenseId: string) => {
    const response = await api.delete(
      `/api/v1/topics/${topicId}/words/${wordSenseId}`,
    );
    return response.data;
  },
};
