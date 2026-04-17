import { wordKeys } from '@/shared/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TopicApi } from '../services/topic.api';

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
