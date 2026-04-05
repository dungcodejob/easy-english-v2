import { useIsAuthenticated } from '@/shared/stores/auth-store';
import { useQuery } from '@tanstack/react-query';
import { StudyApi } from '../services/study.api';
import { studyKeys } from '@/shared/constants';

export const useTopicCards = (topicId: string | null) => {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: studyKeys.topic(topicId ?? ''),
    queryFn: () => StudyApi.getTopicCards(topicId!),
    enabled: !!topicId && isAuthenticated,
  });
};
