import { learningKeys } from '@/shared/constants/key';
import { useQuery } from '@tanstack/react-query';
import { LearningApi } from '../services/learning.api';

interface UseLearningListParams {
  page?: number;
  limit?: number;
}

export const useLearningList = ({
  page = 1,
  limit = 20,
}: UseLearningListParams = {}) => {
  const skip = (page - 1) * limit;

  return useQuery({
    queryKey: learningKeys.list({ page, limit }),
    queryFn: () => LearningApi.getLearningList(limit, skip),
    placeholderData: (previousData) => previousData,
  });
};
