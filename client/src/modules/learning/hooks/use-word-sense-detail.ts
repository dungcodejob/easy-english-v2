import { dictionaryKeys } from '@/shared/constants';
import { useQuery } from '@tanstack/react-query';
import { DictionaryApi } from '../services/dictionary.api';

export const useWordSenseDetail = (senseId: string) => {
  return useQuery({
    queryKey: dictionaryKeys.detail(senseId),
    queryFn: () => DictionaryApi.getWordSenseDetail(senseId),
    enabled: !!senseId,
  });
};
