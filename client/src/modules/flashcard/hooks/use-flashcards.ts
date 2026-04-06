import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FlashcardApi } from '../services/flashcard.api';
import type {
  CreateFlashcardRequest,
  FlashcardResponse,
  UpdateFlashcardRequest,
} from '../types';

export const FLASHCARD_QUERY_KEY = {
  all: ['flashcards'] as const,
  stats: ['flashcards', 'stats'] as const,
  due: ['flashcards', 'due'] as const,
};

export function useFlashcards() {
  return useQuery({
    queryKey: FLASHCARD_QUERY_KEY.all,
    queryFn: () => FlashcardApi.getFlashcards(),
  });
}

export function useStudyStats() {
  return useQuery({
    queryKey: FLASHCARD_QUERY_KEY.stats,
    queryFn: () => FlashcardApi.getStudyStats(),
  });
}

export function useDueCards(limit = 20) {
  return useQuery({
    queryKey: [...FLASHCARD_QUERY_KEY.due, limit],
    queryFn: () => FlashcardApi.getDueCards(limit),
  });
}

export function useCreateFlashcard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFlashcardRequest) =>
      FlashcardApi.createFlashcard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FLASHCARD_QUERY_KEY.all });
    },
  });
}

export function useUpdateFlashcard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFlashcardRequest }) =>
      FlashcardApi.updateFlashcard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FLASHCARD_QUERY_KEY.all });
    },
  });
}

export function useDeleteFlashcard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => FlashcardApi.deleteFlashcard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FLASHCARD_QUERY_KEY.all });
    },
  });
}
