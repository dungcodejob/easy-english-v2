import { topicKeys } from '@/shared/constants';
import { useToastMutation } from '@/shared/hooks';
import { useConfirm } from '@/shared/ui/common/confirm-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { TopicApi, type Topic } from '../../services/topic.api';

export function useDeleteTopic() {
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();
  const mutation = useToastMutation({
    options: {
      mutationFn: (id: string) => TopicApi.deleteTopic(id),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: topicKeys.lists() });
      },
    },
    toast: {
      loading: 'Deleting topic...',
      success: 'Topic deleted successfully!',
      error: 'Failed to delete topic. Please try again.',
    },
  });

  const deleteTopic = async (topic: Topic) => {
    if (!topic) return;

    const ok = await confirm({
      title: 'Are you sure?',
      description: (
        <>
          This action cannot be undone. This will permanently delete
          <span className="font-medium text-foreground"> "{topic.name}"</span>
        </>
      ),
    });

    if (!ok) return;

    await mutation.mutateAsync(topic.id);
  };

  return { ...mutation, deleteTopic };
}
