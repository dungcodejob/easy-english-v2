import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { StudyApi } from '../services/study.api';
import { studyKeys } from '@/shared/constants';
import type {
  StartSessionPayload,
  StartSessionResponse,
  StudyScope,
} from '../types/study.types';

export const useStartSession = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    StartSessionResponse,
    Error,
    StartSessionPayload
  >({
    mutationFn: (payload) => StudyApi.startSession(payload),
    onSuccess: (data) => {
      // Invalidate due list so counts refresh after session ends
      queryClient.invalidateQueries({ queryKey: studyKeys.due() });

      // Navigate to session page with sessionId in URL
      const search: Record<string, string> = {
        sessionId: data.sessionId,
      };

      if (payload.scope === 'TOPIC' && payload.topicId) {
        search.mode = 'topic';
        search.topicId = payload.topicId;
      } else {
        search.mode = 'due';
      }

      navigate({
        to: '/_/learning/study',
        search,
        replace: true,
      });
    },
    onError: () => {
      toast.error('Failed to start study session. Please try again.');
    },
  });
};
