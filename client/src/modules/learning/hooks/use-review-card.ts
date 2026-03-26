import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studyKeys } from '@/shared/constants';
import { StudyApi } from '../services/study.api';
import type { ReviewPayload, ReviewResult } from '../types/study.types';

export const useReviewCard = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ReviewResult,
    Error,
    ReviewPayload
  >({
    mutationFn: (payload) => StudyApi.reviewCard(payload),
    onSuccess: () => {
      // Invalidate due list in background after review
      queryClient.invalidateQueries({ queryKey: studyKeys.due() });
    },
  });
};
