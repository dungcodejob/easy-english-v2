import { Button } from '@/shared/ui/shadcn/button';
import { Card } from '@/shared/ui/shadcn/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/ui/shadcn/pagination';
import { Skeleton } from '@/shared/ui/shadcn/skeleton';
import { Link, useParams } from '@tanstack/react-router';
import { ArrowLeft, BookOpen, Trash } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import {
  useRemoveTopicWordMutation,
  useTopicDetailQuery,
  useTopicWordsQuery,
} from '../hooks/topic.hooks';

export default function TopicDetailPage() {
  // @ts-expect-error - Route types desynced
  const { topicId } = useParams({ strict: false });
  const [page, setPage] = useState(1);

  const {
    data: topic,
    isLoading: isTopicLoading,
    isError: isTopicError,
  } = useTopicDetailQuery(topicId!);
  const { data: wordsData, isLoading: isWordsLoading } = useTopicWordsQuery(
    topicId!,
    page,
    20,
  );
  const removeWord = useRemoveTopicWordMutation();

  const handleRemoveWord = async (wordSenseId: string) => {
    if (
      window.confirm(
        'Are you sure you want to remove this word from the topic?',
      )
    ) {
      try {
        await removeWord.mutateAsync({
          topicId: topicId!,
          wordId: wordSenseId,
        });
        toast.success('Word removed');
      } catch (error) {
        toast.error('Failed to remove word');
      }
    }
  };

  const handlePreviousPage = useCallback(() => {
    if (page > 1) {
      setPage((p) => Math.max(1, p - 1));
    }
  }, [page]);

  const handleNextPage = useCallback(() => {
    if (wordsData?.pagination?.hasMore) {
      setPage((p) => p + 1);
    }
  }, [wordsData?.pagination?.hasMore]);

  if (isTopicLoading) {
    return (
      <div className="container py-8 max-w-5xl mx-auto space-y-8">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-64 w-full mt-8" />
      </div>
    );
  }

  if (isTopicError || !topic) {
    return (
      <div className="text-center py-12 text-destructive">
        Topic not found or failed to load.
        <br />
        <Button variant="link" asChild className="mt-4">
          <Link to="/learning/topics">Back to Topics</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-5xl mx-auto space-y-8">
      <div>
        <Button variant="ghost" size="sm" asChild>
          {/* @ts-expect-error - Route types desynced */}
          <Link to="/learning/topics">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Topics
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{topic.name}</h1>
            {topic.description && (
              <p className="text-muted-foreground mt-2">{topic.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-4">
              Created {new Date(topic.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Words in Topic
        </h2>

        {isWordsLoading ? (
          <div className="space-y-4 shadow-sm border rounded-lg p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : wordsData?.data.length === 0 ? (
          <div className="text-center py-16 border rounded-lg bg-muted/20 border-dashed">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium">No words yet</h3>
            <p className="text-muted-foreground mt-2 mb-6">
              You haven't added any words to this topic yet.
            </p>
            <Button variant="outline" asChild>
              <Link to="/learning">Go to Dictionary</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {wordsData?.data.map((word) => (
              <Card
                key={word.id}
                className="flex flex-row items-center justify-between p-4 shadow-sm"
              >
                <div>
                  <p className="font-medium">
                    Word Sense ID: {word.wordSenseId}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Added {new Date(word.addedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    {/* @ts-expect-error - Route types desynced */}
                    <Link
                      to="/dictionary/senses/$senseId"
                      params={{ senseId: word.wordSenseId }}
                    >
                      View
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveWord(word.wordSenseId)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {(page > 1 || wordsData?.pagination?.hasMore) && (
          <Pagination className="justify-center mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={handlePreviousPage}
                  className={
                    page <= 1
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <span className="text-sm text-muted-foreground mx-4">
                  Page {page} of{' '}
                  {wordsData?.pagination?.count
                    ? Math.ceil(wordsData.pagination.count / 20)
                    : page}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={handleNextPage}
                  className={
                    !wordsData?.pagination?.hasMore
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
