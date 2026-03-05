import { dictionaryKeys } from '@/shared/constants';
import { useQuery } from '@tanstack/react-query';
import { DictionaryApi } from '../services/dictionary.api';

interface UseSearchWordSensesParams {
  query: string;
  top?: number;
  skip?: number;
}

export const useSearchWordSenses = ({
  query,
  top = 20,
  skip = 0,
}: UseSearchWordSensesParams) => {
  return useQuery({
    queryKey: dictionaryKeys.search(query, top, skip),
    queryFn: () => DictionaryApi.searchWordSenses(query, top, skip),
    enabled: query.trim().length >= 1,
    // Add keepPreviousData to prevent layout flash during pagination/re-fetching
    placeholderData: (previousData) => previousData,
  });
};
