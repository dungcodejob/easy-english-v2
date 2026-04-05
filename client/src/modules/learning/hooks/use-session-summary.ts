import { useIsAuthenticated } from '@/shared/stores/auth-store';
import { useQuery } from '@tanstack/react-query';
import { StudyApi } from '../services/study.api';
import { studyKeys } from '@/shared/constants';
import type { SessionSummary } from '../types/study.types';

export const useSessionSummary = (sessionId: string) => {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: studyKeys.sessionSummary(sessionId),
    queryFn: () => StudyApi.getSessionSummary(sessionId),
    enabled: !!sessionId && isAuthenticated,
    retry: false,
  });
};
