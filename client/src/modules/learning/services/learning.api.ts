import { api, type ApiSuccessResponse } from '@/core/api';
import type { LearningListItem } from '../types/learning.types';

export const LearningApi = {
  /**
   * Add a WordSense to the user's learning list.
   */
  addToLearning: async (wordSenseId: string) => {
    const { data } = await api.post<{
      success: boolean;
      data: { id: string };
      meta?: { alreadyLearning: boolean };
    }>(`/api/v1/learning/senses`, { wordSenseId });
    return data;
  },

  /**
   * Remove a WordSense from the user's learning list.
   */
  removeFromLearning: async (senseId: string) => {
    const { data } = await api.delete<{ success: boolean; data: null }>(
      `/api/v1/learning/senses/${senseId}`,
    );
    return data;
  },

  /**
   * Get the user's learning list.
   */
  getLearningList: async (top = 20, skip = 0) => {
    const { data } = await api.get<
      unknown,
      ApiSuccessResponse<LearningListItem[]>
    >(`/api/v1/learning/senses`, {
      params: { $top: top, $skip: skip },
    });
    return data;
  },
};
