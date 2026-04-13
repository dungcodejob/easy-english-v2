import { DsButton } from '@/shared/ui';
import { Skeleton } from '@/shared/ui/shadcn/skeleton';
import { createFileRoute } from '@tanstack/react-router';
import { FolderOpen, PlusCircle, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { CreateTopicDialog } from '../components/create-topic-dialog';
import { TopicCard } from '../components/topic-card';
import { useTopics } from '../hooks/use-topics';

export const Route = createFileRoute('/_(authenticated)/learning/topics')({
  component: TopicsPage,
});

const PAGE_LIMIT = 20;

const CATEGORIES = ['All Topics', 'Professional', 'Leisure', 'Foundation'];

export default function TopicsPage() {
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState('All Topics');
  const { data, isLoading, isError } = useTopics(page, PAGE_LIMIT);

  const topics = data?.data ?? [];
  const totalCount = data?.pagination?.count ?? 0;
  const pagination = data?.pagination;
  const totalPages = pagination ? Math.ceil(totalCount / PAGE_LIMIT) : 1;

  return (
    <div className="px-6 pb-12 md:px-12">
      {/* ── Hero Header ──────────────────────────────────────────── */}
      <div className="relative mb-16 mt-8">
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-headline font-extrabold text-on-primary-fixed tracking-tighter leading-tight mb-4">
            Explore Your <br />
            <span className="text-secondary italic font-light">
              Linguistic Realms
            </span>
          </h1>
          <p className="text-lg text-on-surface-variant max-w-xl leading-relaxed">
            Master English through curated thematic domains. From high-stakes
            boardrooms to the quiet corners of global travel.
          </p>
        </div>

        {/* Asymmetric floating card */}
        <div className="absolute -top-4 right-0 hidden lg:block">
          <div className="max-w-xs rotate-3 rounded-xl border border-white/20 bg-surface/80 p-8 shadow-[0_12px_32px_rgba(26,27,30,0.06)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-tertiary-fixed-dim" />
              <span className="font-headline font-bold text-primary">
                Daily Goal
              </span>
            </div>
            <p className="mb-4 text-sm text-on-surface-variant">
              You're making great progress on your{' '}
              <span className="font-bold text-primary">learning journey</span>.
              Keep going!
            </p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
              <div
                className="h-full rounded-full bg-tertiary-fixed-dim"
                style={{ width: '70%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter & Action Row ──────────────────────────────────── */}
      <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex w-full items-center gap-4 overflow-x-auto pb-2 md:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={
                activeCategory === cat
                  ? 'whitespace-nowrap rounded-full bg-primary px-6 py-2 font-headline text-sm text-white'
                  : 'whitespace-nowrap rounded-full bg-surface-container-low px-6 py-2 font-headline text-sm text-on-surface-variant transition-colors hover:bg-surface-container-high'
              }
            >
              {cat}
            </button>
          ))}
        </div>

        <CreateTopicDialog
          trigger={
            <button className="flex items-center gap-3 whitespace-nowrap rounded-full bg-gradient-to-r from-secondary to-[#00897b] px-8 py-4 font-headline font-bold text-white shadow-xl transition-transform hover:scale-[1.02] active:scale-95">
              <PlusCircle className="h-5 w-5" />
              Create New Topic
            </button>
          }
        />
      </div>

      {/* ── Loading ───────────────────────────────────────────────── */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-surface-container-lowest p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
            >
              <Skeleton className="mb-6 h-14 w-14 rounded-xl" />
              <Skeleton className="mb-2 h-6 w-3/4 rounded" />
              <Skeleton className="mb-8 h-4 w-full rounded" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────── */}
      {isError && !isLoading && (
        <div className="rounded-xl border border-error/30 bg-error-container/30 p-8 text-center">
          <p className="text-sm font-medium text-error">
            Failed to load topics
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">
            Check your connection and refresh the page.
          </p>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────── */}
      {!isLoading && !isError && topics.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant/20 bg-surface-container-lowest py-20 text-center shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container-high text-on-surface-variant">
            <FolderOpen className="h-7 w-7" />
          </div>
          <h2 className="mb-1 font-headline text-base font-semibold text-on-surface">
            No topics yet
          </h2>
          <p className="mb-6 max-w-xs text-sm text-on-surface-variant">
            Create a topic to organise your vocabulary into focused study
            collections.
          </p>
          <CreateTopicDialog
            trigger={
              <DsButton leftIcon={<PlusCircle className="h-4 w-4" />}>
                Create your first topic
              </DsButton>
            }
          />
        </div>
      )}

      {/* ── Topic grid ────────────────────────────────────────────── */}
      {!isLoading && !isError && topics.length > 0 && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
            {topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-20 flex justify-center">
              <div className="flex items-center gap-4 rounded-full bg-surface-container-low px-8 py-3 shadow-sm">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 text-on-surface-variant transition-colors hover:text-primary disabled:opacity-30"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(totalPages, 5) }).map(
                    (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={
                            page === pageNum
                              ? 'flex h-8 w-8 items-center justify-center rounded-full bg-primary font-headline text-sm text-white'
                              : 'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full font-headline text-sm text-on-surface-variant hover:bg-surface-container-high'
                          }
                        >
                          {pageNum}
                        </button>
                      );
                    },
                  )}
                </div>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination?.hasMore}
                  className="p-2 text-on-surface-variant transition-colors hover:text-primary disabled:opacity-30"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
