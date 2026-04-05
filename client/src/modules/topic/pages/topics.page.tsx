/**
 * TopicsPage — Topic module
 *
 * UI: 100% delegated to Design System components.
 */

import { DsButton } from '@/shared/ui';
import { Skeleton } from '@/shared/ui/shadcn/skeleton';
import { createFileRoute } from '@tanstack/react-router';
import { FolderOpen, Plus, Tag } from 'lucide-react';
import { useState } from 'react';
import { CreateTopicDialog } from '../components/create-topic-dialog';
import { TopicCard } from '../components/topic-card';
import { useTopics } from '../hooks/use-topics';

export const Route = createFileRoute('/_(authenticated)/learning/topics')({
  component: TopicsPage,
});

const PAGE_LIMIT = 12;

export default function TopicsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useTopics(page, PAGE_LIMIT);

  const topics = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination ? Math.ceil(pagination.count / PAGE_LIMIT) : 1;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      {/* Page header */}
      <div className="mb-10 flex animate-in fade-in slide-in-from-bottom-4 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between duration-500">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20">
            <Tag className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              My Topics
            </h1>
            <p className="mt-1 text-balance text-muted-foreground">
              Organise your vocabulary into focused study topics.
            </p>
          </div>
        </div>
        <CreateTopicDialog />
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-destructive/20 bg-destructive/5 py-20 text-center">
          <p className="text-lg font-semibold text-destructive">Failed to load topics</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check your connection and try refreshing.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && topics.length === 0 && (
        <div className="flex animate-in fade-in flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border py-24 text-center duration-500">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/8 text-primary">
            <FolderOpen className="h-10 w-10" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-foreground">No topics yet</h2>
          <p className="mb-8 max-w-sm text-muted-foreground">
            Create your first topic to start organising your vocabulary into focused study
            collections.
          </p>
          <CreateTopicDialog
            trigger={
              <DsButton leftIcon={<Plus className="h-5 w-5" />} size="lg">
                Create your first topic
              </DsButton>
            }
          />
        </div>
      )}

      {/* Topic grid */}
      {!isLoading && !isError && topics.length > 0 && (
        <>
          <div className="grid animate-in gap-4 fade-in slide-in-from-bottom-6 duration-600 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
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
                disabled={!pagination?.hasMore}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </DsButton>
            </div>
          )}
        </>
      )}
    </div>
  );
}
