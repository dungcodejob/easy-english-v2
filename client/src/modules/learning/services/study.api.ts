import { api, apiCall, type ApiSuccessResponse } from '@/core/api';
import type {
  StudyCardsEnvelope,
  TopicStudyCardsEnvelope,
  ReviewPayload,
  ReviewResult,
} from '../types/study.types';

export const StudyApi = {
  /**
   * Get due study cards for the current user.
   */
  getDueCards: async () => {
    const result = await apiCall(() =>
      api.get<unknown, ApiSuccessResponse<StudyCardsEnvelope>>(
        '/learning/study/due',
      ),
    );
    return result;
  },

  /**
   * Get study cards for a specific topic.
   */
  getTopicCards: async (topicId: string) => {
    const result = await apiCall(() =>
      api.get<unknown, ApiSuccessResponse<TopicStudyCardsEnvelope>>(
        `/learning/study/topic/${topicId}`,
      ),
    );
    return result;
  },

  /**
   * Submit a review for a word sense.
   * Reuses existing learning review endpoint.
   */
  reviewCard: async (payload: ReviewPayload) => {
    const { data } = await api.post<
      ApiSuccessResponse<ReviewResult>,
      ReviewPayload
    >(`/learning/senses/${payload.wordSenseId}/review`, {
      rating: payload.rating,
      reviewDurationMs: payload.reviewDurationMs,
    });
    return data;
  },
};
