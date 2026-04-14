import { topicKeys } from '@/shared/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TopicApi } from '../../services/topic.api';

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
