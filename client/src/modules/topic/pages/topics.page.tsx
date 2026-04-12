import { DsButton, DsSpinner } from '@/shared/ui';
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

// Demo categories — replace with real data from API when available
const CATEGORIES = ['All', 'Vocabulary', 'Grammar', 'Idioms', 'Business', 'Travel'];

export default function TopicsPage() {
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState('All');
  const { data, isLoading, isError } = useTopics(page, PAGE_LIMIT);

  const topics = data?.data?.data ?? [];
  const totalCount = data?.pagination?.count ?? 0;
  const pagination = data?.pagination;
  const totalPages = pagination ? Math.ceil(totalCount / PAGE_LIMIT) : 1;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <h1 className="mb-8 font-headline text-4xl font-bold italic text-primary">
        Explore Your Linguistic Realms
      </h1>

      {/* ── Category tabs ─────────────────────────────────────────── */}
      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={
              activeCategory === cat
                ? 'rounded-full bg-gradient-to-br from-primary to-primary-container px-5 py-2 text-sm font-medium text-white shadow-md transition-all'
                : 'rounded-full bg-surface-container px-5 py-2 text-sm font-medium text-on-surface-variant transition-all hover:bg-surface-container-high'
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-headline text-xl font-semibold text-on-surface">
            {isLoading ? (
              <span className="inline-flex items-center gap-1.5">
                <DsSpinner size="sm" /> Loading…
              </span>
            ) : (
              `${totalCount} ${totalCount === 1 ? 'topic' : 'topics'}`
            )}
          </h2>
        </div>
        <CreateTopicDialog
          trigger={
            <DsButton size="sm" leftIcon={<Plus className="size-3.5" />}>
              New Topic
            </DsButton>
          }
        />
      </div>

      {/* ── Loading ───────────────────────────────────────────────── */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-outline-variant/20 bg-surface-container p-6">
              <Skeleton className="mb-3 h-4 w-24 rounded-full" />
              <Skeleton className="mb-2 h-5 w-3/4 rounded" />
              <Skeleton className="mb-4 h-4 w-full rounded" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────── */}
      {isError && !isLoading && (
        <div className="rounded-2xl border border-error/30 bg-error-container/30 p-8 text-center">
          <p className="text-sm font-medium text-error">Failed to load topics</p>
          <p className="mt-1 text-xs text-on-surface-variant">
            Check your connection and refresh the page.
          </p>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────── */}
      {!isLoading && !isError && topics.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-outline-variant/20 bg-surface-container py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container-high text-on-surface-variant">
            <FolderOpen className="h-7 w-7" />
          </div>
          <h2 className="mb-1 font-headline text-base font-semibold text-on-surface">
            No topics yet
          </h2>
          <p className="mb-6 max-w-xs text-sm text-on-surface-variant">
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

      {/* ── Topic grid ────────────────────────────────────────────── */}
      {!isLoading && !isError && topics.length > 0 && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            {topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4">
              <span className="text-xs text-on-surface-variant">
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
