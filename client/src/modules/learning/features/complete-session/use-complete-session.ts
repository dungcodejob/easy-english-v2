import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { studyKeys } from '@/shared/constants';
import { StudyApi } from '../../services/study.api';
import type { CompleteSessionResponse } from '../../types/study.types';

export const useCompleteSession = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<CompleteSessionResponse, Error, string>({
    mutationFn: (sessionId) => StudyApi.completeSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: studyKeys.due() });

      navigate({
        to: '/_/learning/study',
        search: {
          sessionId,
          completed: 'true',
        },
        replace: true,
      });
    },
  });
};
