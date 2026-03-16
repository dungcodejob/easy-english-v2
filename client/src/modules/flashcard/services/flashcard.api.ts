import { api, apiCall, type ApiSuccessResponse } from '@/core/api';
import type {
  CreateFlashcardRequest,
  DueCard,
  FlashcardResponse,
  StudyStatsResponse,
  UpdateFlashcardRequest,
} from '../types';

export const FlashcardApi = {
  /**
   * Get all flashcards for the current user.
   */
  getFlashcards: async () => {
    const result = await apiCall(() =>
      api.get<unknown, ApiSuccessResponse<FlashcardResponse[]>>(`/flashcards`),
    );
    return result;
  },

  /**
   * Create a new flashcard.
   */
  createFlashcard: async (data: CreateFlashcardRequest) => {
    const { data: response } = await api.post<
      ApiSuccessResponse<FlashcardResponse>
    >(`/flashcards`, data);
    return response;
  },

  /**
   * Update an existing flashcard.
   */
  updateFlashcard: async (id: string, data: UpdateFlashcardRequest) => {
    const { data: response } = await api.put<
      ApiSuccessResponse<FlashcardResponse>
    >(`/flashcards/${id}`, data);
    return response;
  },

  /**
   * Delete a flashcard.
   */
  deleteFlashcard: async (id: string) => {
    const { data: response } = await api.delete<ApiSuccessResponse<boolean>>(
      `/flashcards/${id}`,
    );
    return response;
  },

  /**
   * Get study statistics.
   */
  getStudyStats: async () => {
    const result = await apiCall(() =>
      api.get<unknown, ApiSuccessResponse<StudyStatsResponse>>(`/study/stats`),
    );
    return result;
  },

  /**
   * Get cards due for review.
   */
  getDueCards: async (limit = 20) => {
    const result = await apiCall(() =>
      api.get<unknown, ApiSuccessResponse<DueCard[]>>(`/study/due`, {
        params: { limit },
      }),
    );
    return result;
  },
};
