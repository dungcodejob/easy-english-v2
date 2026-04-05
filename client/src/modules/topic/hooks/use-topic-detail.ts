import { topicKeys } from '@/shared/constants';
import { useQuery } from '@tanstack/react-query';
import type { ApiSuccessResponse } from '@/core/api/api.model';
import type { Topic } from '../services/topic.api';
import { TopicApi } from '../services/topic.api';

export function useTopicDetail(id: string) {
  return useQuery<ApiSuccessResponse<Topic>>({
    queryKey: topicKeys.detail(id),
    queryFn: () => TopicApi.getTopicDetail(id),
    enabled: !!id,
  });
}
