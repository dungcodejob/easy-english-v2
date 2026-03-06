import { api, apiCall, type ApiSuccessResponse } from '@/core/api';
import type { WordSenseSearchResult } from '../types/learning.types';

// Using types defined in the search results
export interface WordSenseDetail {
  senseId: string;
  wordText: string;
  normalizedText: string;
  partOfSpeech: string;
  definition: string;
  shortDefinition: string | null;
  cefrLevel: string | null;
  definitionVi: string | null;
  examples: Array<{
    text: string;
    translationVi: string | null;
    order: number;
  }>;
  synonyms: string[];
  antonyms: string[];
  idioms: string[];
  phrases: string[];
  collocations: any | null;
  pronunciations: Array<{
    ipa: string | null;
    audioUrl: string | null;
    region: string | null;
  }>;
  learningState: {
    isLearning: boolean;
    masteryLevel: number;
    reviewCount: number;
    nextReviewAt: string;
  } | null;
}

export const DictionaryApi = {
  /**
   * Search for WordSenses by query.
   */
  searchWordSenses: async (query: string, top = 20, skip = 0) => {
    const result = await apiCall(() =>
      api.get<unknown, ApiSuccessResponse<WordSenseSearchResult[]>>(
        `/dictionary/search`,
        {
          params: { q: query, $top: top, $skip: skip },
        },
      ),
    );

    return result;
  },

  /**
   * Get full details for a specific WordSense.
   */
  getWordSenseDetail: async (senseId: string) => {
    const { data } = await api.get<{ success: boolean; data: WordSenseDetail }>(
      `/api/v1/dictionary/senses/${senseId}`,
    );
    return data.data; // Return the inner data object
  },
};
