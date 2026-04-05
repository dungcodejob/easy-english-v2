import { useIsAuthenticated } from '@/shared/stores/auth-store';
import { useQuery } from '@tanstack/react-query';
import { StudyApi } from '../services/study.api';
import { studyKeys } from '@/shared/constants';

export const useDueCards = () => {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: studyKeys.due(),
    queryFn: () => StudyApi.getDueCards(),
    enabled: isAuthenticated,
  });
};
