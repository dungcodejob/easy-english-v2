import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studyKeys } from '@/shared/constants';
import { StudyApi } from '../../services/study.api';
import type { ReviewPayload, ReviewResult } from '../../types/study.types';

export const useReviewCard = (sessionId?: string) => {
  const queryClient = useQueryClient();

  return useMutation<ReviewResult, Error, ReviewPayload>({
    mutationFn: (payload) =>
      sessionId
        ? StudyApi.reviewCardSession({ ...payload, sessionId })
        : StudyApi.reviewCard(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyKeys.due() });
    },
  });
};
