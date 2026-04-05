import { api, apiCall } from '@/core/api';
import type { ApiSuccessResponse } from '@/core/api/api.model';
import type {
  StudyCardsEnvelope,
  TopicStudyCardsEnvelope,
  ReviewPayload,
  ReviewResult,
  StartSessionPayload,
  StartSessionResponse,
  SessionReviewPayload,
  CompleteSessionResponse,
  SessionSummary,
} from '../types/study.types';

export const StudyApi = {
  // -------------------------------------------------------------------------
  // Phase 1 — existing card retrieval endpoints (kept for backwards compat)
  // -------------------------------------------------------------------------

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
   * Submit a review for a word sense (standalone — no session context).
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

  // -------------------------------------------------------------------------
  // Phase 2 — session-aware endpoints
  // -------------------------------------------------------------------------

  /**
   * Start a new study session and receive the card set.
   */
  startSession: async (payload: StartSessionPayload) => {
    const { data } = await api.post<
      ApiSuccessResponse<StartSessionResponse>,
      StartSessionPayload
    >('/learning/study/session/start', payload);
    return data;
  },

  /**
   * Submit a review within a specific study session.
   */
  reviewCardSession: async (payload: SessionReviewPayload) => {
    const { data } = await api.post<
      ApiSuccessResponse<ReviewResult>,
      SessionReviewPayload
    >('/learning/study/session/review', payload);
    return data;
  },

  /**
   * Mark a study session as completed.
   */
  completeSession: async (sessionId: string) => {
    const { data } = await api.post<
      ApiSuccessResponse<CompleteSessionResponse>,
      Record<string, never>
    >(`/learning/study/session/${sessionId}/complete`, {});
    return data;
  },

  /**
   * Fetch the server-computed summary for a study session.
   */
  getSessionSummary: async (sessionId: string) => {
    const result = await apiCall(() =>
      api.get<unknown, ApiSuccessResponse<SessionSummary>>(
        `/learning/study/session/${sessionId}`,
      ),
    );
    return result;
  },
};
