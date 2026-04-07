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
import { Separator } from '@/shared/ui/shadcn/separator';
import { Skeleton } from '@/shared/ui/shadcn/skeleton';
import {
  createFileRoute,
  Link,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { ArrowLeft, BookOpen, Inbox, Pencil, Plus, Trash2 } from 'lucide-react';
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
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* ── Breadcrumb ──────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5">
        <Link
          to={TopicRoutes.list()}
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Topics
        </Link>
        <span className="text-muted-foreground/50">/</span>
        <span className="text-sm font-medium text-foreground">
          {isLoadingTopic ? (
            <Skeleton className="inline-block h-4 w-24" />
          ) : (
            (topic?.name ?? 'Topic')
          )}
        </span>
      </nav>

      {/* ── Topic header ────────────────────────────────────────── */}
      {isLoadingTopic && (
        <div className="mb-6 space-y-2">
          <Skeleton className="h-7 w-48 rounded" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
      )}

      {isTopicError && !isLoadingTopic && (
        <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Could not load topic details.
        </div>
      )}

      {topic && !isLoadingTopic && (
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                {topic.name}
              </h1>
              {topic.description && (
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {topic.description}
                </p>
              )}
              {wordPagination && (
                <p className="mt-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {wordPagination.count}
                  </span>{' '}
                  {wordPagination.count === 1 ? 'word' : 'words'}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1">
              <UpdateTopicDialog
                topic={topic}
                trigger={
                  <DsButton
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </DsButton>
                }
              />
              <DsAlertDialog>
                <DsAlertDialogTrigger asChild>
                  <DsButton
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
        </div>
      )}

      <Separator />

      {/* ── Words section ───────────────────────────────────────── */}
      <section className="pt-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Words
          </span>
          <Link to={DictionaryRoutes.search()}>
            <DsButton
              variant="outline"
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Add words
            </DsButton>
          </Link>
        </div>

        {/* Loading */}
        {isLoadingWords && (
          <div className="space-y-px">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-3.5 flex-1 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {isWordsError && !isLoadingWords && (
          <div className="py-8 text-center text-sm text-destructive">
            Failed to load words.
          </div>
        )}

        {/* Empty state */}
        {!isLoadingWords && !isWordsError && words.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Inbox className="h-6 w-6" />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-foreground">
              No words yet
            </h3>
            <p className="mb-5 max-w-xs text-xs text-muted-foreground">
              Search the dictionary to find words and add them to this topic.
            </p>
            <Link to={DictionaryRoutes.search()}>
              <DsButton
                size="sm"
                leftIcon={<BookOpen className="h-3.5 w-3.5" />}
              >
                Browse Dictionary
              </DsButton>
            </Link>
          </div>
        )}

        {/* Word list */}
        {!isLoadingWords && !isWordsError && words.length > 0 && (
          <>
            <div className="divide-y divide-border">
              {words.map((word) => (
                <TopicWordCard key={word.id} word={word} topicId={topicId} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <span className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <DsButton
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </DsButton>
                  <DsButton
                    variant="outline"
                    size="sm"
                    disabled={!wordPagination?.hasMore}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </DsButton>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
