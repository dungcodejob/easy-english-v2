import { useQueryClient } from '@tanstack/react-query';

import { topicKeys } from '@/shared/constants';
import { useToastMutation } from '@/shared/hooks';
import { useConfirm } from '@/shared/ui/common/confirm-dialog';
import { TopicApi, type TopicWord } from '../../services/topic.api';

export function useRemoveTopicWord(topicId: string) {
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();
  const mutation = useToastMutation({
    options: {
      mutationFn: (wordId: string) => TopicApi.removeWord(topicId, wordId),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: topicKeys.lists() });
      },
    },
    toast: {
      loading: 'Removing word from topic...',
      success: 'Word removed from topic.',
      error: 'Failed to remove word. Please try again.',
    },
  });

  const removeWordFromTopic = async (word: TopicWord) => {
    if (!word.id) return;

    const ok = await confirm({
      title: 'Are you sure?',
      description: (
        <>
          This action cannot be undone. This will permanently delete
          <span className="font-medium text-foreground">
            {' '}
            "{word.wordText}"
          </span>
        </>
      ),
    });

    if (!ok) return;

    await mutation.mutateAsync(word.id);
  };

  return { ...mutation, removeWordFromTopic };
}
