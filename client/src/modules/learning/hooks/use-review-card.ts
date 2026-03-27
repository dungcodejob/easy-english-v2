import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studyKeys } from '@/shared/constants';
import { StudyApi } from '../services/study.api';
import type { ReviewPayload, ReviewResult } from '../types/study.types';

/**
 * Review mutation hook.
 * - When `sessionId` is absent: calls standalone POST /learning/senses/:id/review
 * - When `sessionId` is present: calls session-scoped POST /learning/study/session/review
 */
export const useReviewCard = (sessionId?: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    ReviewResult,
    Error,
    ReviewPayload
  >({
    mutationFn: (payload) =>
      sessionId
        ? StudyApi.reviewCardSession({ ...payload, sessionId })
        : StudyApi.reviewCard(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyKeys.due() });
    },
  });
};
