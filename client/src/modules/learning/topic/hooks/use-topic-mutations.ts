import { topicKeys, wordKeys } from '@/shared/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TopicApi } from '../services/topic.api';

export function useCreateTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      description,
    }: {
      name: string;
      description?: string;
    }) => TopicApi.createTopic(name, description),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: topicKeys.lists() });
      toast.success('Topic created successfully!');
    },
    onError: () => {
      toast.error('Failed to create topic. Please try again.');
    },
  });
}

export function useUpdateTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      name,
      description,
    }: {
      id: string;
      name: string;
      description?: string;
    }) => TopicApi.updateTopic(id, name, description),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: topicKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: topicKeys.detail(id) });
      toast.success('Topic updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update topic. Please try again.');
    },
  });
}

export function useDeleteTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => TopicApi.deleteTopic(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: topicKeys.lists() });
      toast.success('Topic deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete topic. Please try again.');
    },
  });
}

/** Add a word sense to a topic. topicId is passed alongside wordSenseId at mutation call time. */
export function useAddTopicWord(topicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (wordSenseId: string) => TopicApi.addWord(topicId, wordSenseId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: wordKeys.byTopic(topicId),
      });
      toast.success('Word added to topic!');
    },
    onError: () => {
      toast.error('Failed to add word.');
    },
  });
}

/** Remove a word from a topic. */
export function useRemoveTopicWord(topicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (wordId: string) => TopicApi.removeWord(topicId, wordId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: wordKeys.byTopic(topicId),
      });
      toast.success('Word removed from topic.');
    },
    onError: () => {
      toast.error('Failed to remove word.');
    },
  });
}

/** A "lazy" version of addTopicWord where both topicId and wordSenseId are passed at mutation time.
 *  Useful for cases where topicId is not known at hook init time. */
export function useAddWordToTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      topicId,
      wordSenseId,
    }: {
      topicId: string;
      wordSenseId: string;
    }) => TopicApi.addWord(topicId, wordSenseId),
    onSuccess: (_, { topicId }) => {
      void queryClient.invalidateQueries({
        queryKey: wordKeys.byTopic(topicId),
      });
      toast.success('Word added to topic!');
    },
    onError: () => {
      toast.error('Failed to add word.');
    },
  });
}
