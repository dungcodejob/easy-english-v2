import type { ApiSuccessResponse } from '@/core/api';
import { dictionaryKeys } from '@/shared/constants';
import { usePaginationQuery } from '@/shared/hooks';
import { DictionaryApi } from '../../../learning/services/dictionary.api';
import type { WordSenseSearchResult } from '../../../learning/types/learning.types';

interface UseSearchWordSensesParams {
  query?: string;
}

export const useSearchWordSenses = ({ query }: UseSearchWordSensesParams) => {
  const safeQuery = (query ?? '').trim();

  return usePaginationQuery<ApiSuccessResponse<WordSenseSearchResult[]>>({
    queryKey: ({ top, skip }) => dictionaryKeys.search(safeQuery, top, skip),
    queryFn: ({ top, skip }) =>
      DictionaryApi.searchWordSenses(safeQuery, top, skip),
    enabled: safeQuery.length >= 1,
  });
};
