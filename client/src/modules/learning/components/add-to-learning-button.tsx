import { AuthRoutes, LearnRoutes, TopicRoutes } from '@/shared/constants';
import { useAuthStore } from '@/shared/stores/auth-store';
import { Button } from '@/shared/ui/shadcn/button';
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
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  FolderPlus,
  Loader2,
} from 'lucide-react';
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

  const handleAddToLearning = () => {
    if (!isAuthenticated) {
      toast.error('You need to login to save words to your learning list');
      navigate({
        to: AuthRoutes.login(),
      });
      return;
    }

    if (isLearning) {
      // Navigate to learning list or just silently ignore
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
    <div className={cn('flex items-center gap-1', className)}>
      <Button
        onClick={handleAddToLearning}
        disabled={isPending || (isLearning && !isAuthenticated)}
        variant={isLearning ? 'secondary' : 'default'}
        className={cn(
          'transition-all duration-300 min-w-36',
          isLearning
            ? 'bg-primary/10 text-primary border-transparent opacity-100 font-medium hover:bg-primary/20'
            : 'shadow-md hover:shadow-lg',
        )}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : isLearning ? (
          <>
            <BookmarkCheck className="mr-2 h-4 w-4 text-primary" />
            Already Learning
          </>
        ) : (
          <>
            <Bookmark className="mr-2 h-4 w-4" />
            Learn This Word
          </>
        )}
      </Button>

      {isAuthenticated && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={isLearning ? 'secondary' : 'default'}
              size="icon"
              className={cn(
                'transition-all duration-300 w-10 shrink-0',
                isLearning
                  ? 'bg-primary/10 text-primary border-transparent opacity-100 hover:bg-primary/20'
                  : 'shadow-md hover:shadow-lg',
              )}
            >
              <ChevronDown className="h-4 w-4" />
              <span className="sr-only">Add to Topic</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Add to Topic</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isLoadingTopics ? (
              <div className="p-2 text-sm text-muted-foreground text-center">
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
              <div className="p-2 text-sm text-muted-foreground text-center">
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
      )}
    </div>
  );
}
