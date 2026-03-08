import { api, apiCall, type ApiSuccessResponse } from '@/core/api';
import type { LearningListItem } from '../types/learning.types';

export const LearningApi = {
  /**
   * Add a WordSense to the user's learning list.
   */
  addToLearning: async (wordSenseId: string) => {
    const { data } = await api.post<
      ApiSuccessResponse<{
        id: string;
        alreadyLearning: boolean;
      }>
    >(`/learning/senses`, { wordSenseId });
    return data;
  },

  /**
   * Remove a WordSense from the user's learning list.
   */
  removeFromLearning: async (senseId: string) => {
    const { data } = await api.delete<ApiSuccessResponse<null>>(
      `/learning/senses/${senseId}`,
    );
    return data;
  },

  /**
   * Get the user's learning list.
   */
  getLearningList: async (top = 20, skip = 0) => {
    const result = await apiCall(() =>
      api.get<unknown, ApiSuccessResponse<LearningListItem[]>>(
        `/learning/senses`,
        {
          params: { $top: top, $skip: skip },
        },
      ),
    );
    return result;
  },
};
