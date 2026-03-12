import { APP_ROUTES } from '@/shared/constants';
import { Badge } from '@/shared/ui/shadcn/badge';
import { Button } from '@/shared/ui/shadcn/button';
import { Separator } from '@/shared/ui/shadcn/separator';
import { Skeleton } from '@/shared/ui/shadcn/skeleton';
import { createFileRoute, Link, useParams } from '@tanstack/react-router';
import { ArrowLeft, BookOpen, ChevronRight, Hash, Inbox } from 'lucide-react';
import { useState } from 'react';
import { TopicWordCard } from '../components/topic-word-card';
import { useTopicDetail } from '../hooks/use-topic-detail';
import { useTopicWords } from '../hooks/use-topic-words';

export const Route = createFileRoute(
  '/_(authenticated)/learning/topics/$topicId',
)({
  component: TopicDetailPage,
});

const WORD_LIMIT = 20;

export default function TopicDetailPage() {
  const { topicId } = useParams({
    from: '/_(authenticated)/learning/topics/$topicId',
  });
  const [page, setPage] = useState(1);

  const {
    data: topicResponse,
    isLoading: isLoadingTopic,
    isError: isTopicError,
  } = useTopicDetail(topicId);

  const {
    data: wordsResponse,
    isLoading: isLoadingWords,
    isError: isWordsError,
  } = useTopicWords(topicId, page, WORD_LIMIT);

  const topic = topicResponse?.data;
  const words = wordsResponse?.data?.data ?? [];
  const wordPagination = wordsResponse?.data?.pagination;
  const totalPages = wordPagination
    ? Math.ceil(wordPagination.count / WORD_LIMIT)
    : 1;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground animate-in fade-in duration-300"
      >
        <Link
          to={APP_ROUTES.TOPIC.LIST}
          className="flex items-center gap-1 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          My Topics
        </Link>
        <ChevronRight className="h-3.5 w-3.5 opacity-50" />
        <span className="font-medium text-foreground">
          {isLoadingTopic ? (
            <Skeleton className="inline-block h-4 w-28" />
          ) : (
            (topic?.name ?? 'Topic')
          )}
        </span>
      </nav>

      {/* Topic header */}
      {isLoadingTopic && (
        <div className="mb-10 space-y-3 animate-pulse">
          <Skeleton className="h-10 w-2/3 rounded-lg" />
          <Skeleton className="h-5 w-full rounded" />
          <Skeleton className="h-5 w-4/5 rounded" />
        </div>
      )}

      {isTopicError && !isLoadingTopic && (
        <div className="mb-8 rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center text-destructive">
          Could not load topic details.
        </div>
      )}

      {topic && !isLoadingTopic && (
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20">
              <BookOpen className="h-8 w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                {topic.name}
              </h1>
              {topic.description && (
                <p className="mt-2 text-muted-foreground text-balance leading-relaxed">
                  {topic.description}
                </p>
              )}
              {wordPagination && (
                <div className="mt-3 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-full gap-1.5 font-medium"
                  >
                    <Hash className="h-3 w-3" />
                    {wordPagination.count}{' '}
                    {wordPagination.count === 1 ? 'word' : 'words'}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Separator className="mb-8 opacity-50" />

      {/* Word list section */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Words</h2>
          {/* Future: Add word button linking back to dictionary search */}
          <Link to={APP_ROUTES.DICTIONARY.SEARCH}>
            <Button variant="outline" size="sm" className="gap-2 rounded-lg">
              <BookOpen className="h-4 w-4" />
              Add words
            </Button>
          </Link>
        </div>

        {/* Loading skeleton */}
        {isLoadingWords && (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* Error */}
        {isWordsError && !isLoadingWords && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 py-12 text-center text-destructive">
            Failed to load words.
          </div>
        )}

        {/* Empty state */}
        {!isLoadingWords && !isWordsError && words.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border py-20 text-center animate-in fade-in duration-500">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Inbox className="h-8 w-8" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-foreground">
              No words yet
            </h3>
            <p className="mb-6 max-w-xs text-sm text-muted-foreground">
              Search the dictionary to find words and add them to this topic.
            </p>
            <Link to={APP_ROUTES.DICTIONARY.SEARCH}>
              <Button className="gap-2 rounded-xl font-semibold">
                <BookOpen className="h-4 w-4" />
                Browse Dictionary
              </Button>
            </Link>
          </div>
        )}

        {/* Word cards */}
        {!isLoadingWords && !isWordsError && words.length > 0 && (
          <>
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {words.map((word) => (
                <TopicWordCard key={word.id} word={word} topicId={topicId} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg"
                >
                  Previous
                </Button>
                <span className="px-4 text-sm text-muted-foreground tabular-nums">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!wordPagination?.hasMore}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
