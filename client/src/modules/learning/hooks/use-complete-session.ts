import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { StudyApi } from '../services/study.api';
import { studyKeys } from '@/shared/constants';
import type { CompleteSessionResponse } from '../types/study.types';

export const useCompleteSession = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    CompleteSessionResponse,
    Error,
    string
  >({
    mutationFn: (sessionId) => StudyApi.completeSession(sessionId),
    onSuccess: (data, sessionId) => {
      // Invalidate due cards so the next load reflects updated due state
      queryClient.invalidateQueries({ queryKey: studyKeys.due() });

      // Navigate to session page showing summary with completed=true
      navigate({
        to: '/_/learning/study',
        search: {
          sessionId,
          completed: 'true',
        },
        replace: true,
      });
    },
    onError: () => {
      // Even on error, redirect to summary so user isn't stuck
      // The summary endpoint will show whatever data is persisted
    },
  });
};
