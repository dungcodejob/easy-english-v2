import { topicKeys } from '@/shared/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TopicApi } from '../../services/topic.api';

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
