import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { studyKeys } from '@/shared/constants';
import { StudyApi } from '../../services/study.api';
import type {
  StartSessionPayload,
  StartSessionResponse,
} from '../../types/study.types';

export const useStartSession = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<StartSessionResponse, Error, StartSessionPayload>({
    mutationFn: (payload) => StudyApi.startSession(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: studyKeys.due() });

      const search: Record<string, string> = {
        sessionId: data.sessionId,
      };

      if (variables.scope === 'TOPIC' && variables.topicId) {
        search.mode = 'topic';
        search.topicId = variables.topicId;
      } else if (variables.studyType === 'QUIZ') {
        search.mode = 'quiz';
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
