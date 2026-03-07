import { dictionaryKeys, learningKeys } from '@/shared/constants/key';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LearningApi } from '../services/learning.api';

export const useAddToLearning = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (senseId: string) => LearningApi.addToLearning(senseId),
    onSuccess: (_, senseId) => {
      // Invalidate the detail query to reflect changes (update learningState)
      queryClient.invalidateQueries({
        queryKey: dictionaryKeys.detail(senseId),
      });

      // Invalidate existing learning lists
      queryClient.invalidateQueries({
        queryKey: learningKeys.lists(),
      });
    },
  });
};
