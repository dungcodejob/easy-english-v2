import { APP_ROUTES } from '@/shared/constants';
import { useAuthStore } from '@/shared/stores/auth-store';
import { Button } from '@/shared/ui/shadcn/button';
import { cn } from '@/shared/utils';
import { useNavigate } from '@tanstack/react-router';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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

  const handleClick = () => {
    if (!isAuthenticated) {
      toast.error('You need to login to save words to your learning list');
      navigate({
        to: APP_ROUTES.AUTH.LOGIN,
      });
      return;
    }

    if (isLearning) {
      // Navigate to learning list or just silently ignore
      navigate({ to: APP_ROUTES.LEARN });
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

  return (
    <Button
      onClick={handleClick}
      disabled={isPending || (isLearning && !isAuthenticated)}
      variant={isLearning ? 'secondary' : 'default'}
      className={cn(
        'transition-all duration-300 min-w-36',
        isLearning
          ? 'bg-primary/10 text-primary border-transparent opacity-100 font-medium hover:bg-primary/20'
          : 'shadow-md hover:shadow-lg',
        className,
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
  );
}
