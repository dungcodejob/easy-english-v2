/**
 * TopicDetailPage — Topic module
 *
 * Layout matches the "Clarion Study" HTML mockup:
 * Hero with stats + floating glass card, filter pills + search,
 * 3-col bento vocabulary grid, dashed "Add" slot, pill pagination.
 *
 * [MOCK] Topic mastery % — backend does not support this yet.
 * [MOCK] Filter pills (All / Learning / Mastered / Due for Review) — UI only.
 * [MOCK] Search input — UI only, no filtering logic yet.
 */

import { DictionaryRoutes, TopicRoutes } from '@/shared/constants';
import { DsPagination } from '@/shared/ui';
import { useConfirm } from '@/shared/ui/common/confirm-dialog/use-confirm-dialog';
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
  Inbox,
  Pencil,
  Plus,
  Search,
  Zap,
} from 'lucide-react';
import { useRef, useState } from 'react';
import {
  TopicDialog,
  type TopicDialogHandle,
} from '../../components/create-or-update-topic/topic-dialog';
import { DeleteTopicButton } from '../../components/delete-topic/delete-topic-button';
import { TopicWordCard } from '../../components/topic-word-card';
import { useTopicDetail } from '../../hooks/use-topic-detail';
import { useRemoveTopicWord } from '../../hooks/use-topic-mutations';
import { useTopicWords } from '../../hooks/use-topic-words';
import type { TopicWord } from '../../services/topic.api';

export const Route = createFileRoute(
  '/_(authenticated)/learning/topics/$topicId',
)({
  component: TopicDetailPage,
});

const WORD_LIMIT = 20;

// [MOCK] Filter options — backend does not support word-level status filtering yet
const FILTER_OPTIONS = ['All', 'Learning', 'Mastered', 'Due for Review'];

export default function TopicDetailPage() {
  const { topicId } = useParams({
    from: '/_(authenticated)/learning/topics/$topicId',
  });
  const dialogRef = useRef<TopicDialogHandle>(null);
  const [page, setPage] = useState(1);
  // [MOCK] active filter — UI only, no filtering logic
  const [activeFilter, setActiveFilter] = useState('All');
  // [MOCK] search query — UI only
  const [searchQuery, setSearchQuery] = useState('');

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

  const { mutate: removeWord } = useRemoveTopicWord(topicId);
  const { confirm } = useConfirm();
  const navigate = useNavigate();

  const handleRemoveWord = async (word: TopicWord) => {
    const ok = await confirm({
      title: 'Remove word?',
      description: (
        <>
          This will remove{' '}
          <strong className="text-foreground">
            {word.wordText ?? 'this word'}
          </strong>{' '}
          from the topic. The word will still be in your learning list.
        </>
      ),
      confirmText: 'Remove',
      destructive: true,
    });
    if (ok) removeWord(word.id);
  };

  const onDeleted = () => {
    navigate({ to: TopicRoutes.list() });
  };

  const topic = topicResponse?.data;
  const paginatedWords = wordsResponse?.data;
  const words = paginatedWords?.data ?? [];
  const wordPagination = paginatedWords?.pagination;
  const totalPages = wordPagination
    ? Math.ceil(wordPagination.count / WORD_LIMIT)
    : 1;

  // [MOCK] topic mastery — replace when backend supports it
  const mockMastery = 68;

  return (
    <div className="mx-auto max-w-7xl px-6 pb-12 pt-6 md:px-8">
      {/* ── Back nav ──────────────────────────────────────────────── */}
      <div className="mb-8">
        <Link
          to={TopicRoutes.list()}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Topics
        </Link>
      </div>

      {/* ── Hero Header ───────────────────────────────────────────── */}
      {isLoadingTopic && (
        <section className="relative mb-12 flex flex-col gap-12 md:flex-row md:items-end">
          <div className="flex-1 space-y-6">
            <Skeleton className="h-7 w-32 rounded-full" />
            <Skeleton className="h-16 w-80 rounded-xl" />
            <Skeleton className="h-5 w-96" />
            <div className="flex gap-8 py-4">
              <Skeleton className="h-14 w-36" />
              <Skeleton className="h-14 w-36" />
            </div>
            <Skeleton className="h-14 w-52 rounded-full" />
          </div>
          <Skeleton className="h-96 w-full rounded-xl md:w-80" />
        </section>
      )}

      {isTopicError && !isLoadingTopic && (
        <div className="mb-12 rounded-xl border border-error/30 bg-error-container/30 p-8 text-center">
          <p className="text-sm font-medium text-error">
            Could not load topic details.
          </p>
        </div>
      )}

      {topic && !isLoadingTopic && (
        <section className="relative mb-12 flex flex-col gap-12 md:flex-row md:items-end">
          {/* Left: topic info */}
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <span className="inline-block rounded-full bg-secondary-container px-3 py-1 text-xs font-bold uppercase tracking-widest text-on-secondary-container">
                Specialization
              </span>
              <h1 className="font-headline text-6xl font-extrabold leading-tight tracking-tight text-on-primary-fixed">
                {topic.name}
              </h1>
            </div>

            {topic.description && (
              <p className="max-w-2xl text-xl leading-relaxed text-on-surface-variant">
                {topic.description}
              </p>
            )}

            {/* Stats row */}
            <div className="flex gap-8 py-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-tighter text-on-surface-variant">
                  Vocabulary
                </p>
                <p className="font-headline text-3xl font-bold text-primary">
                  {wordPagination?.count ?? 0}{' '}
                  <span className="text-lg font-medium text-outline">
                    words
                  </span>
                </p>
              </div>
              <div className="h-12 w-px bg-outline-variant/30" />
              {/* [MOCK] Topic Mastery — backend does not support this yet */}
              <div>
                <p className="text-sm font-bold uppercase tracking-tighter text-on-surface-variant">
                  Topic Mastery
                </p>
                <p className="font-headline text-3xl font-bold text-secondary">
                  {mockMastery}%
                </p>
              </div>
            </div>

            {/* Primary CTA + actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button className="rounded-full bg-gradient-to-br from-primary to-primary-container px-8 py-4 font-headline text-lg font-bold text-white shadow-xl shadow-primary/10 transition-all hover:shadow-primary/20 active:scale-95">
                Start Topic Review
              </button>
              <button
                onClick={() => dialogRef.current?.open(topic)}
                className="flex items-center gap-2 rounded-full bg-surface-container px-5 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
              <DeleteTopicButton topic={topic} onDeleted={onDeleted} />
            </div>
          </div>

          {/* Right: Asymmetric Floating Glass Card */}
          <div className="relative h-96 w-full shrink-0 overflow-hidden rounded-xl bg-surface-container-low shadow-sm md:w-80">
            {/* Background gradient layers to simulate the image aesthetic */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/40 via-surface-container to-secondary-fixed/30" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />

            {/* Centered decorative icon */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <BookOpen className="h-32 w-32 text-primary" />
            </div>

            {/* Bottom glass overlay — "Current Goal" */}
            <div className="absolute bottom-6 left-6 right-6 rounded-lg border border-white/20 bg-white/20 p-5 backdrop-blur-xl">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-white/80">
                Current Goal
              </p>
              <p className="font-headline font-medium leading-snug text-white">
                Master all vocabulary in this topic
              </p>
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/30">
                <div
                  className="h-full bg-tertiary-fixed-dim"
                  style={{ width: `${mockMastery}%` }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Search and Filters ────────────────────────────────────── */}
      {/* [MOCK] Filter pills + search — UI only, no real filtering logic yet */}
      {topic && !isLoadingTopic && (
        <section className="mb-8 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex gap-2 rounded-full bg-surface-container-low p-1">
            {FILTER_OPTIONS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={
                  activeFilter === filter
                    ? 'rounded-full bg-white px-6 py-2 text-sm font-bold text-primary shadow-sm'
                    : 'rounded-full px-6 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high'
                }
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vocabulary..."
              className="w-full rounded-full border-none bg-surface-container-lowest py-3 pl-12 pr-4 text-sm font-medium ring-1 ring-outline-variant/30 transition-all focus:ring-2 focus:ring-secondary"
            />
          </div>
        </section>
      )}

      {/* ── Vocabulary Bento Grid ─────────────────────────────────── */}

      {/* Loading skeleton grid */}
      {isLoadingWords && (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
          ))}
        </section>
      )}

      {/* Error */}
      {isWordsError && !isLoadingWords && (
        <div className="rounded-xl border border-error/30 bg-error-container/30 p-8 text-center text-sm text-error">
          Failed to load words.
        </div>
      )}

      {/* Empty state */}
      {!isLoadingWords && !isWordsError && words.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/40 py-24 text-center transition-colors hover:border-primary-fixed hover:bg-surface-container-low">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container text-outline-variant">
            <Inbox className="h-8 w-8" />
          </div>
          <h3 className="mb-1 font-headline text-sm font-bold uppercase tracking-widest text-on-surface">
            No words yet
          </h3>
          <p className="mb-6 max-w-xs text-sm text-on-surface-variant">
            Search the dictionary to find words and add them to this topic.
          </p>
          <Link
            to={DictionaryRoutes.search()}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-primary to-primary-container px-8 py-4 font-headline font-bold text-white shadow-xl shadow-primary/10 transition-all active:scale-95"
          >
            <BookOpen className="h-5 w-5" />
            Browse Dictionary
          </Link>
        </div>
      )}

      {/* Word bento grid */}
      {!isLoadingWords && !isWordsError && words.length > 0 && (
        <>
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {words.map((word) => (
              <TopicWordCard
                key={word.id}
                word={word}
                onRemove={handleRemoveWord}
              />
            ))}

            {/* Add New Word slot — matches mockup's dashed card */}
            <Link
              to={DictionaryRoutes.search()}
              className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/40 p-8 text-outline-variant transition-all hover:border-primary-fixed hover:bg-surface-container-low"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container transition-colors group-hover:bg-primary-fixed">
                <Plus className="h-8 w-8 transition-colors group-hover:text-primary" />
              </div>
              <p className="font-headline text-sm font-bold uppercase tracking-widest transition-colors group-hover:text-primary">
                Add Custom Term
              </p>
            </Link>
          </section>

          {/* Pagination */}
          <DsPagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            variant="minimal"
            className="mt-16 pb-12"
          />
        </>
      )}

      {/* ── FAB: Quick Practice ───────────────────────────────────── */}
      <button className="fixed bottom-8 right-8 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-tertiary-fixed-dim text-on-tertiary-fixed shadow-2xl transition-all hover:scale-110 active:scale-95">
        <Zap className="h-7 w-7" fill="currentColor" />
      </button>

      {/* ── Imperative edit dialog ───────────────────────────────── */}
      <TopicDialog ref={dialogRef} />
    </div>
  );
}
