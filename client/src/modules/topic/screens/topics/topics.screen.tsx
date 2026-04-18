import { DsButton, DsPagination } from '@/shared/ui';
import { Skeleton } from '@/shared/ui/shadcn/skeleton';
import { createFileRoute } from '@tanstack/react-router';
import { FolderOpen, PlusCircle, Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';

import {
  TopicDialog,
  type TopicDialogHandle,
} from '../../components/create-or-update-topic/topic-dialog';
import { useDeleteTopic } from '../../components/delete-topic/use-delete-topic';
import { useTopics } from '../../hooks/use-topics';
import type { Topic } from '../../services/topic.api';
import { TopicCardItem } from './topic-card-item';

export const Route = createFileRoute('/_(authenticated)/learning/topics')({
  component: TopicsPage,
});

const PAGE_LIMIT = 20;

export default function TopicsPage() {
  const [page, setPage] = useState(1);
  const dialogRef = useRef<TopicDialogHandle>(null);
  const { data, isLoading, isError } = useTopics(page, PAGE_LIMIT);
  const { deleteTopic } = useDeleteTopic();

  const topics = data?.data ?? [];
  const totalCount = data?.pagination?.count ?? 0;
  const pagination = data?.pagination;
  const totalPages = pagination ? Math.ceil(totalCount / PAGE_LIMIT) : 1;

  const onHandleEdit = (topic: Topic) => dialogRef.current?.open(topic);
  const onHandleDelete = (topic: Topic) => deleteTopic(topic);

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

      {/* ── Action Row ─────────────────────────────────────────── */}
      <div className="mb-12 flex items-center justify-end">
        <TopicDialog
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
          <TopicDialog
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
              <TopicCardItem
                key={topic.id}
                topic={topic}
                onEdit={onHandleEdit}
                onDelete={onHandleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          <DsPagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="mt-20"
          />
        </>
      )}

      {/* ── Imperative edit dialog (opened via ref) ──────────────── */}
      <TopicDialog ref={dialogRef} />
    </div>
  );
}
