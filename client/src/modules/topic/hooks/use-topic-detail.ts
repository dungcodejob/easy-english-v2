import { topicKeys } from '@/shared/constants';
import { useQuery } from '@tanstack/react-query';
import { TopicApi } from '../services/topic.api';

export function useTopicDetail(id: string) {
  return useQuery({
    queryKey: topicKeys.detail(id),
    queryFn: () => TopicApi.getTopicDetail(id),
    enabled: !!id,
  });
}
