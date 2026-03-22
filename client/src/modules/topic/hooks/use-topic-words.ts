import { wordKeys } from '@/shared/constants';
import { useQuery } from '@tanstack/react-query';
import type { ApiSuccessResponse } from '@/core/api/api.model';
import type { PaginatedResponse, TopicWord } from '../services/topic.api';
import { TopicApi } from '../services/topic.api';

export function useTopicWords(topicId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return useQuery<ApiSuccessResponse<PaginatedResponse<TopicWord>>>({
    queryKey: [...wordKeys.byTopic(topicId), { page, limit }],
    queryFn: () => TopicApi.getTopicWords(topicId, limit, skip),
    enabled: !!topicId,
  });
}
