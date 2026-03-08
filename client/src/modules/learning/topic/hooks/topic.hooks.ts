import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AddTopicWordDto,
  CreateTopicDto,
  UpdateTopicDto,
} from '../services/topic.api';
import { topicApi } from '../services/topic.api';

export const topicKeys = {
  all: ['topics'] as const,
  lists: () => [...topicKeys.all, 'list'] as const,
  list: (params: { page: number; limit: number }) =>
    [...topicKeys.lists(), params] as const,
  details: () => [...topicKeys.all, 'detail'] as const,
  detail: (id: string) => [...topicKeys.details(), id] as const,
  words: (topicId: string) => [...topicKeys.detail(topicId), 'words'] as const,
  wordsList: (topicId: string, params: { page: number; limit: number }) =>
    [...topicKeys.words(topicId), params] as const,
};

export function useTopicsQuery(page = 1, limit = 20) {
  return useQuery({
    queryKey: topicKeys.list({ page, limit }),
    queryFn: () => topicApi.listTopics(limit, (page - 1) * limit),
  });
}

export function useTopicDetailQuery(id: string) {
  return useQuery({
    queryKey: topicKeys.detail(id),
    queryFn: () => topicApi.getTopic(id),
    enabled: !!id,
  });
}

export function useTopicWordsQuery(topicId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: topicKeys.wordsList(topicId, { page, limit }),
    queryFn: () => topicApi.listTopicWords(topicId, limit, (page - 1) * limit),
    enabled: !!topicId,
  });
}

export function useCreateTopicMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTopicDto) => topicApi.createTopic(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicKeys.lists() });
    },
  });
}

export function useUpdateTopicMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTopicDto }) =>
      topicApi.updateTopic(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: topicKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: topicKeys.lists() });
    },
  });
}

export function useDeleteTopicMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => topicApi.deleteTopic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicKeys.all });
    },
  });
}

export function useAddTopicWordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      topicId,
      data,
    }: {
      topicId: string;
      data: AddTopicWordDto;
    }) => topicApi.addWordToTopic(topicId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: topicKeys.words(variables.topicId),
      });
    },
  });
}

export function useRemoveTopicWordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ topicId, wordId }: { topicId: string; wordId: string }) =>
      topicApi.removeWordFromTopic(topicId, wordId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: topicKeys.words(variables.topicId),
      });
    },
  });
}
