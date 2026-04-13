import { AuthRoutes, LearnRoutes, TopicRoutes } from '@/shared/constants';
import { useAuthStore } from '@/shared/stores/auth-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu';
import { cn } from '@/shared/utils';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, BookmarkCheck, FolderPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAddWordToTopic } from '../../topic/hooks/use-topic-mutations';
import { useTopics } from '../../topic/hooks/use-topics';
import { useAddToLearning } from '../hooks/use-add-to-learning';

interface AddToLearningButtonProps {
  senseId: string;
  isLearning: boolean;
  className?: string;
}

export function AddToLearningButton({
  senseId,
  isLearning,
  className,
}: AddToLearningButtonProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();
  const { mutate, isPending } = useAddToLearning();

  const { data: topicsData, isLoading: isLoadingTopics } = useTopics(1, 50);
  const { mutate: addWordToTopic } = useAddWordToTopic();
  const topics = topicsData?.data ?? [];

  const handleStudyNow = () => {
    if (!isAuthenticated) {
      toast.error('You need to login to save words to your learning list');
      navigate({ to: AuthRoutes.login() });
      return;
    }

    if (isLearning) {
      navigate({ to: LearnRoutes.base() });
      return;
    }

    mutate(senseId, {
      onSuccess: () => {
        toast.success('Successfully added to your learning list');
      },
      onError: (err) => {
        console.error('Add to learning failed:', err);
        toast.error('Failed to add word. Please try again.');
      },
    });
  };

  const handleAddToTopic = (topicId: string, topicName: string) => {
    if (!isAuthenticated) {
      toast.error('You need to login to save words to topics');
      navigate({ to: AuthRoutes.login() });
      return;
    }

    addWordToTopic(
      { topicId, wordSenseId: senseId },
      {
        onSuccess: () => toast.success(`Added to topic "${topicName}"`),
        onError: () =>
          toast.error(
            'Failed to add word to topic. It might already be there.',
          ),
      },
    );
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Study Now button */}
      <button
        onClick={handleStudyNow}
        disabled={isPending || (isLearning && !isAuthenticated)}
        className={cn(
          'w-full rounded-full py-4 font-bold shadow-lg transition-transform active:scale-95 disabled:opacity-50',
          isLearning
            ? 'bg-secondary text-white'
            : 'bg-tertiary-fixed-dim text-primary hover:bg-tertiary-fixed',
        )}
      >
        {isPending ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Adding...
          </span>
        ) : isLearning ? (
          <span className="inline-flex items-center gap-2">
            <BookmarkCheck className="h-4 w-4" />
            Already Learning
          </span>
        ) : (
          'Study Now'
        )}
      </button>

      {/* Add to List button */}
      {isAuthenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full rounded-full border border-white/30 bg-transparent py-4 font-medium text-white transition-colors hover:bg-white/10">
              Add to List
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56">
            <DropdownMenuLabel>Add to Topic</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isLoadingTopics ? (
              <div className="p-2 text-center text-sm text-muted-foreground">
                Loading topics...
              </div>
            ) : topics.length > 0 ? (
              topics.map((topic) => (
                <DropdownMenuItem
                  key={topic.id}
                  onClick={() => handleAddToTopic(topic.id, topic.name)}
                >
                  <FolderPlus className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{topic.name}</span>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-2 text-center text-sm text-muted-foreground">
                No topics found
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate({ to: TopicRoutes.list() })}
            >
              <ArrowRight className="mr-2 h-4 w-4 text-muted-foreground" />
              Manage Topics
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <button
          onClick={() => navigate({ to: AuthRoutes.login() })}
          className="w-full rounded-full border border-white/30 bg-transparent py-4 font-medium text-white transition-colors hover:bg-white/10"
        >
          Add to List
        </button>
      )}
    </div>
  );
}
