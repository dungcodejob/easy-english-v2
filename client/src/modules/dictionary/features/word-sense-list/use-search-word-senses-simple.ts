import type { ApiSuccessResponse } from '@/core/api';
import { dictionaryKeys } from '@/shared/constants';
import { useQuery } from '@tanstack/react-query';
import { DictionaryApi } from '../../../learning/services/dictionary.api';
import type { WordSenseSearchResult } from '../../../learning/types/learning.types';

interface UseSearchWordSensesSimpleParams {
  query?: string;
  top?: number;
  skip?: number;
}

/**
 * Lightweight search hook with explicit top/skip — no URL pagination.
 * Use this for fixed-size result sets (e.g. search menus, autocomplete dropdowns).
 */
export const useSearchWordSensesSimple = ({
  query,
  top = 5,
  skip = 0,
}: UseSearchWordSensesSimpleParams) => {
  const safeQuery = (query ?? '').trim();

  return useQuery<ApiSuccessResponse<WordSenseSearchResult[]>>({
    queryKey: dictionaryKeys.search(safeQuery, top, skip),
    queryFn: () => DictionaryApi.searchWordSenses(safeQuery, top, skip),
    enabled: safeQuery.length >= 1,
    placeholderData: (previousData) => previousData,
  });
};
