import { DsButton, DsSpinner } from '@/shared/ui';
import { Separator } from '@/shared/ui/shadcn/separator';
import { Skeleton } from '@/shared/ui/shadcn/skeleton';
import { createFileRoute } from '@tanstack/react-router';
import { FolderOpen, Plus } from 'lucide-react';
import { useState } from 'react';
import { CreateTopicDialog } from '../components/create-topic-dialog';
import { TopicCard } from '../components/topic-card';
import { useTopics } from '../hooks/use-topics';

export const Route = createFileRoute('/_(authenticated)/learning/topics')({
  component: TopicsPage,
});

const PAGE_LIMIT = 20;

export default function TopicsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useTopics(page, PAGE_LIMIT);

  const topics = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination ? Math.ceil(pagination.count / PAGE_LIMIT) : 1;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Topics</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {isLoading ? (
              <span className="inline-flex items-center gap-1.5">
                <DsSpinner size="sm" /> Loading…
              </span>
            ) : (
              `${pagination?.count ?? 0} ${(pagination?.count ?? 0) === 1 ? 'topic' : 'topics'}`
            )}
          </p>
        </div>
        <CreateTopicDialog
          trigger={
            <DsButton size="sm" leftIcon={<Plus className="size-3.5" />}>
              New Topic
            </DsButton>
          }
        />
      </div>

      <Separator />

      {/* ── Column headers ────────────────────────────────────── */}
      {!isLoading && !isError && topics.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2">
          <span className="flex-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Name
          </span>
          <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Updated
          </span>
          {/* Actions column spacer */}
          <span className="w-20" />
          {/* Chevron spacer */}
          <span className="w-3.5" />
        </div>
      )}

      {/* ── Loading ───────────────────────────────────────────── */}
      {isLoading && (
        <div className="py-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="h-4 flex-1 rounded" />
              <Skeleton className="h-3.5 w-16 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────── */}
      {isError && !isLoading && (
        <div className="py-12 text-center">
          <p className="text-sm font-medium text-destructive">Failed to load topics</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Check your connection and refresh the page.
          </p>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────── */}
      {!isLoading && !isError && topics.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <FolderOpen className="h-7 w-7" />
          </div>
          <h2 className="mb-1 text-base font-semibold text-foreground">No topics yet</h2>
          <p className="mb-6 max-w-xs text-sm text-muted-foreground">
            Create a topic to organise your vocabulary into focused study collections.
          </p>
          <CreateTopicDialog
            trigger={
              <DsButton leftIcon={<Plus className="h-4 w-4" />}>
                Create your first topic
              </DsButton>
            }
          />
        </div>
      )}

      {/* ── Topic list ────────────────────────────────────────── */}
      {!isLoading && !isError && topics.length > 0 && (
        <>
          <div className="divide-y divide-border">
            {topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>

          {/* Pagination */}
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
                  disabled={!pagination?.hasMore}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </DsButton>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
