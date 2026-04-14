import { topicKeys } from '@/shared/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TopicApi } from '../../services/topic.api';

export function useCreateTopic() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      name,
      description,
    }: {
      name: string;
      description?: string;
    }) => TopicApi.createTopic(name, description),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: topicKeys.lists() });
    },
  });

  return {
    ...mutation,
    mutateAsync: (data: { name: string; description?: string }) =>
      toast.promise(mutation.mutateAsync(data), {
        loading: 'Creating topic...',
        success: 'Topic created successfully!',
        error: 'Failed to create topic. Please try again.',
      }),
  };
}
