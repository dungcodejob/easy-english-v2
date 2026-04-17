import { useConfirm } from '@/shared/ui/common/confirm-dialog/use-confirm-dialog';
import { Trash2 } from 'lucide-react';
import { useDeleteTopic } from '../../hooks/use-topic-mutations';
import type { Topic } from '../../services/topic.api';

type DeleteTopicButtonProps = {
  topic: Topic;
  onDeleted?: () => void; // 👈 cho parent control
};

export function DeleteTopicButton({
  topic,
  onDeleted,
}: DeleteTopicButtonProps) {
  const { mutateAsync: deleteTopic } = useDeleteTopic();
  const { confirm } = useConfirm();

  const onDelete = async () => {
    const ok = await confirm({
      title: 'Delete topic',
      description: (
        <>
          This action cannot be undone. This will permanently delete the
          certificate
          {topic && (
            <span className="font-medium text-foreground">
              {' '}
              "{topic.name}"{' '}
            </span>
          )}
          and remove it from our servers.
        </>
      ),
    });
    if (ok) return;

    await deleteTopic(topic.id);

    onDeleted?.();
  };

  return (
    <button
      onClick={onDelete}
      className="flex items-center gap-2 rounded-full bg-error-container/30 px-5 py-2.5 text-sm font-medium text-on-error-container transition-colors hover:bg-error-container"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Delete
    </button>
  );
}
