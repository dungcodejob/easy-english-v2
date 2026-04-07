import { useTopics } from '@/modules/topic/hooks/use-topics';
import { LearnRoutes, TopicRoutes } from '@/shared/constants';
import { DsButton, DsSpinner } from '@/shared/ui';
import { Separator } from '@/shared/ui/shadcn/separator';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/shadcn/tabs';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { BookOpen, ChevronRight, Play } from 'lucide-react';
import { useState } from 'react';
import { LearningList } from '../components/learning-list';
import { useDueCards } from '../hooks/use-due-cards';
import { useStartSession } from '../hooks/use-start-session';

export const Route = createFileRoute('/_(authenticated)/learning')({
  component: MyLearningPage,
});

export default function MyLearningPage() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { data: dueData, isLoading: loadingDue } = useDueCards();
  const { data: topicsData, isLoading: loadingTopics } = useTopics(1, 8);
  const [studyType, setStudyType] = useState<'FLASHCARD' | 'QUIZ'>('FLASHCARD');
  const startMutation = useStartSession();

  const dueCount = dueData?.data?.total ?? 0;
  const topics = topicsData?.data?.data ?? [];

  const handleStartReview = () =>
    startMutation.mutate({ scope: 'DUE', studyType });

  const handleStudyTopic = (topicId: string) => {
    navigate({
      to: LearnRoutes.study(),
      search: { mode: 'topic', topicId, index: 0 },
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">My Learning</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {loadingDue ? (
              <span className="inline-flex items-center gap-1.5">
                <DsSpinner size="sm" /> Loading…
              </span>
            ) : dueCount > 0 ? (
              <>
                <span className="font-medium text-foreground">{dueCount}</span>{' '}
                {dueCount === 1 ? 'card' : 'cards'} due for review
              </>
            ) : (
              'All caught up for today'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Tabs
            value={studyType}
            onValueChange={(v) => setStudyType(v as 'FLASHCARD' | 'QUIZ')}
          >
            <TabsList className="h-8 text-xs">
              <TabsTrigger value="FLASHCARD" className="px-2.5 text-xs">
                Flashcard
              </TabsTrigger>
              <TabsTrigger value="QUIZ" className="px-2.5 text-xs">
                Quiz
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <DsButton
            size="sm"
            leftIcon={<Play className="size-3" />}
            onClick={handleStartReview}
            disabled={loadingDue || dueCount === 0}
          >
            {dueCount > 0 ? `Review (${dueCount})` : 'All caught up'}
          </DsButton>
        </div>
      </div>

      <Separator />

      {/* ── Study by Topic ──────────────────────────────────────── */}
      <section className="py-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Study by Topic
          </span>
          <Link
            to={TopicRoutes.list()}
            className="flex items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            All topics <ChevronRight className="size-3" />
          </Link>
        </div>

        {loadingTopics ? (
          <div className="flex gap-2">
            {[80, 100, 72, 90].map((w, i) => (
              <div
                key={i}
                className="h-8 animate-pulse rounded-full bg-muted"
                style={{ width: w }}
              />
            ))}
          </div>
        ) : topics.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No topics yet.{' '}
            <Link
              to={TopicRoutes.list()}
              className="text-foreground underline underline-offset-4"
            >
              Create one
            </Link>{' '}
            to study by topic.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleStudyTopic(topic.id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              >
                <BookOpen className="size-3" />
                {topic.name}
              </button>
            ))}
          </div>
        )}
      </section>

      <Separator />

      {/* ── Vocabulary ──────────────────────────────────────────── */}
      <section className="pt-6">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Your Vocabulary
          </span>
        </div>
        <LearningList page={page} onPageChange={setPage} />
      </section>
    </div>
  );
}
