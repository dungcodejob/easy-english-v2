/**
 * TopicDetailPage — Topic module
 *
 * UI: 100% delegated to Design System components.
 */

import { DictionaryRoutes, TopicRoutes } from '@/shared/constants';
import {
  DsAlertDialog,
  DsAlertDialogAction,
  DsAlertDialogCancel,
  DsAlertDialogContent,
  DsAlertDialogDescription,
  DsAlertDialogFooter,
  DsAlertDialogHeader,
  DsAlertDialogTitle,
  DsAlertDialogTrigger,
  DsButton,
} from '@/shared/ui';
import { Badge } from '@/shared/ui/shadcn/badge';
import { Separator } from '@/shared/ui/shadcn/separator';
import { Skeleton } from '@/shared/ui/shadcn/skeleton';
import {
  createFileRoute,
  Link,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Hash,
  Inbox,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { TopicWordCard } from '../components/topic-word-card';
import { UpdateTopicDialog } from '../components/update-topic-dialog';
import { useTopicDetail } from '../hooks/use-topic-detail';
import { useDeleteTopic } from '../hooks/use-topic-mutations';
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

  const { mutate: deleteTopic } = useDeleteTopic();
  const navigate = useNavigate();

  const handleDelete = () => {
    deleteTopic(topicId, {
      onSuccess: () => void navigate({ to: TopicRoutes.list() }),
    });
  };

  const topic = topicResponse?.data;
  const words = wordsResponse?.data ?? [];
  const wordPagination = wordsResponse?.pagination;
  const totalPages = wordPagination
    ? Math.ceil(wordPagination.count / WORD_LIMIT)
    : 1;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex animate-in items-center gap-1.5 text-sm text-muted-foreground fade-in duration-300"
      >
        <Link
          to={TopicRoutes.list()}
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
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                  {topic.name}
                </h1>
                <div className="flex items-center gap-1">
                  <UpdateTopicDialog
                    topic={topic}
                    trigger={
                      <DsButton
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </DsButton>
                    }
                  />
                  <DsAlertDialog>
                    <DsAlertDialogTrigger asChild>
                      <DsButton
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </DsButton>
                    </DsAlertDialogTrigger>
                    <DsAlertDialogContent>
                      <DsAlertDialogHeader>
                        <DsAlertDialogTitle>Delete topic?</DsAlertDialogTitle>
                        <DsAlertDialogDescription>
                          This will permanently delete{' '}
                          <strong className="text-foreground">{topic.name}</strong>{' '}
                          and remove all its word associations. Words in your
                          learning list will not be affected.
                        </DsAlertDialogDescription>
                      </DsAlertDialogHeader>
                      <DsAlertDialogFooter>
                        <DsAlertDialogCancel>Cancel</DsAlertDialogCancel>
                        <DsAlertDialogAction onClick={handleDelete}>
                          Delete topic
                        </DsAlertDialogAction>
                      </DsAlertDialogFooter>
                    </DsAlertDialogContent>
                  </DsAlertDialog>
                </div>
              </div>
              {topic.description && (
                <p className="mt-2 text-balance leading-relaxed text-muted-foreground">
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
          <Link to={DictionaryRoutes.search()}>
            <DsButton
              variant="outline"
              size="sm"
              leftIcon={<BookOpen className="h-4 w-4" />}
            >
              Add words
            </DsButton>
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
          <div className="flex animate-in fade-in flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border py-20 text-center duration-500">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Inbox className="h-8 w-8" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-foreground">
              No words yet
            </h3>
            <p className="mb-6 max-w-xs text-sm text-muted-foreground">
              Search the dictionary to find words and add them to this topic.
            </p>
            <Link to={DictionaryRoutes.search()}>
              <DsButton leftIcon={<BookOpen className="h-4 w-4" />}>
                Browse Dictionary
              </DsButton>
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
                <DsButton
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </DsButton>
                <span className="px-4 text-sm text-muted-foreground tabular-nums">
                  Page {page} of {totalPages}
                </span>
                <DsButton
                  variant="outline"
                  disabled={!wordPagination?.hasMore}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </DsButton>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
