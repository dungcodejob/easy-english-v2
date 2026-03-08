import { APP_ROUTES } from '@/shared/constants';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/shadcn/alert-dialog';
import { Badge } from '@/shared/ui/shadcn/badge';
import { Button } from '@/shared/ui/shadcn/button';
import { Skeleton } from '@/shared/ui/shadcn/skeleton';
import { Link } from '@tanstack/react-router';
import { ArrowRight, BookOpen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useLearningList } from '../hooks/use-learning-list';
import { useRemoveFromLearning } from '../hooks/use-remove-from-learning';
import type { LearningListItem } from '../types/learning.types';
import { WordSenseSheet } from './word-sense-sheet';

interface LearningListProps {
  page: number;
  onPageChange: (page: number) => void;
}

export function LearningList({ page, onPageChange }: LearningListProps) {
  const [selectedSenseId, setSelectedSenseId] = useState<string | null>(null);

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useLearningList({ page, limit: 20 });
  const { mutate: remove, isPending: isRemoving } = useRemoveFromLearning();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/50 bg-destructive/10 p-12 text-center text-destructive">
        <p className="mb-4">Failed to load learning list. {error?.message}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="border-destructive/50 text-destructive hover:bg-destructive hover:text-white"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const list: LearningListItem[] = response?.data || [];
  const pagination = response?.pagination;

  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center text-muted-foreground bg-muted/30">
        <BookOpen className="mb-4 h-12 w-12 opacity-50" />
        <h3 className="mb-2 text-lg font-medium text-foreground">
          Your learning list is empty
        </h3>
        <p className="mb-6 max-w-sm">
          You haven't added any words to your learning list yet. Search the
          dictionary to add words!
        </p>
        <Button asChild>
          <Link to={APP_ROUTES.DICTIONARY.SEARCH}>Explore Dictionary</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((item) => (
            <div
              key={item.senseId}
              className="group relative flex flex-col justify-between rounded-xl border bg-card p-5 text-card-foreground shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md cursor-pointer"
            >
              <button
                type="button"
                onClick={() => setSelectedSenseId(item.senseId)}
                className="absolute inset-0 z-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full h-full text-left"
                aria-label={`View details for ${item.wordText}`}
              />
              <div className="relative z-10 pointer-events-none">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">
                    {item.wordText}
                  </h3>
                  <div className="flex items-center gap-2 pointer-events-auto">
                    <Badge
                      variant={item.masteryLevel >= 4 ? 'default' : 'secondary'}
                      className="px-2 py-0.5 text-xs font-medium"
                    >
                      Level {item.masteryLevel}
                    </Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive z-20 relative"
                          disabled={isRemoving}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Remove from learning?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove &quot;
                            {item.wordText}
                            &quot; from your learning list? Your progress will
                            be hidden until you add it back.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => remove(item.senseId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="italic">{item.partOfSpeech}</span>
                  {item.cefrLevel && (
                    <>
                      <span>&bull;</span>
                      <span className="font-semibold">{item.cefrLevel}</span>
                    </>
                  )}
                </div>
                <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
                  {item.shortDefinition || 'No short definition available.'}
                </p>
              </div>

              <div className="relative z-10 mt-5 flex pointer-events-none items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Score: {item.reviewCount} reviews
                </span>
                <div className="flex items-center gap-1.5 text-xs font-medium text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  Review Details
                  <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {pagination &&
          pagination.count !== undefined &&
          pagination.count > 20 && (
            <div className="flex items-center justify-between rounded-lg border bg-muted/10 px-4 py-3 sm:px-6 mt-8">
              <p className="text-sm text-muted-foreground">
                Showing{' '}
                <span className="font-medium">
                  {(pagination.skip ?? 0) + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min((pagination.skip ?? 0) + 20, pagination.count)}
                </span>{' '}
                of <span className="font-medium">{pagination.count}</span> words
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page === 1}
                  className="bg-background"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(page + 1)}
                  disabled={!pagination.hasMore}
                  className="bg-background"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
      </div>

      <WordSenseSheet
        senseId={selectedSenseId}
        onOpenChange={(open) => {
          if (!open) setSelectedSenseId(null);
        }}
      />
    </>
  );
}
