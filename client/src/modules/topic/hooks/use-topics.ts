import { topicKeys } from '@/shared/constants';
import { useQuery } from '@tanstack/react-query';
import type { ApiSuccessResponse } from '@/core/api/api.model';
import type { PaginatedResponse, Topic } from '../services/topic.api';
import { TopicApi } from '../services/topic.api';

export function useTopics(
  page = 1,
  limit = 12,
) {
  const skip = (page - 1) * limit;
  return useQuery<ApiSuccessResponse<PaginatedResponse<Topic>>>({
    queryKey: topicKeys.list({ page, limit }),
    queryFn: () => TopicApi.getTopics(limit, skip),
  });
}
