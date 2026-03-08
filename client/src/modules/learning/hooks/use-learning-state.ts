import { learningKeys } from '@/shared/constants';
import { useIsAuthenticated } from '@/shared/stores/auth-store';
import { useQuery } from '@tanstack/react-query';
import { LearningApi } from '../services/learning.api';

export const useLearningState = (senseId: string) => {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: learningKeys.state(senseId),
    queryFn: () => LearningApi.getLearningState(senseId),
    enabled: !!senseId && isAuthenticated,
  });
};
