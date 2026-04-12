import { useTopics } from '@/modules/topic/hooks/use-topics';
import { LearnRoutes, TopicRoutes } from '@/shared/constants';
import { DsButton, DsSpinner } from '@/shared/ui';
import { Separator } from '@/shared/ui/shadcn/separator';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/shadcn/tabs';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
  BookOpen,
  ChevronRight,
  PlugZap,
  Play,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
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
    <div className="space-y-8">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="font-headline text-4xl font-bold text-primary mb-2">
          Easy English Study Hub
        </h1>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container text-sm text-on-surface-variant">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          Current Status: Resume Last Session
        </div>
      </div>

      {/* ── Words Due Today CTA ───────────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-br from-secondary to-[#00876e] p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/20 text-sm text-white/90 mb-3">
              <Zap className="size-3.5" />
              {loadingDue ? (
                <DsSpinner size="sm" />
              ) : dueCount > 0 ? (
                `${dueCount} cards waiting`
              ) : (
                'All caught up!'
              )}
            </div>
            <h2 className="font-headline text-2xl font-bold mb-1">
              Words Due Today
            </h2>
            <p className="text-white/80 text-sm">
              {dueCount > 0
                ? 'Time to review your flashcards and keep your streak going!'
                : 'You have no cards due. Great job staying on top of your learning!'}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Tabs
              value={studyType}
              onValueChange={(v) => setStudyType(v as 'FLASHCARD' | 'QUIZ')}
            >
              <TabsList className="h-9 text-xs bg-white/10 text-white data-[active=true]:bg-white data-[active=true]:text-secondary">
                <TabsTrigger
                  value="FLASHCARD"
                  className="px-3 text-xs text-white/80 data-[active=true]:text-white"
                >
                  Flashcard
                </TabsTrigger>
                <TabsTrigger
                  value="QUIZ"
                  className="px-3 text-xs text-white/80 data-[active=true]:text-white"
                >
                  Quiz
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <DsButton
              leftIcon={<Play className="size-4" />}
              onClick={handleStartReview}
              disabled={loadingDue || dueCount === 0}
              className="bg-white text-secondary rounded-full px-8 py-4 font-headline font-bold text-lg shadow-lg"
              variant="secondary"
            >
              {dueCount > 0 ? `Review (${dueCount})` : 'All caught up'}
            </DsButton>
          </div>
        </div>
      </div>

      {/* ── Bento Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Review — large card */}
        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-6 row-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-headline text-lg font-semibold text-on-surface">
                Daily Review
              </h3>
              <p className="text-sm text-on-surface-variant mt-0.5">
                Your learning stats
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <Target className="size-5 text-secondary" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-high">
              <TrendingUp className="size-4 text-secondary" />
              <div>
                <p className="text-xs text-on-surface-variant">Mastery</p>
                <p className="text-sm font-semibold text-on-surface">78%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-high">
              <BookOpen className="size-4 text-primary" />
              <div>
                <p className="text-xs text-on-surface-variant">Words Learned</p>
                <p className="text-sm font-semibold text-on-surface">24</p>
              </div>
            </div>
          </div>
        </div>

        {/* Speed Quiz — small card */}
        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-headline text-lg font-semibold text-on-surface">
                Speed Quiz
              </h3>
              <p className="text-sm text-on-surface-variant mt-0.5">
                Quick 5-minute drill
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <PlugZap className="size-5 text-primary" />
            </div>
          </div>
          <DsButton
            variant="outline"
            size="sm"
            onClick={() => {
              setStudyType('QUIZ');
              startMutation.mutate({ scope: 'DUE', studyType: 'QUIZ' });
            }}
            className="mt-2"
          >
            Start Quiz
          </DsButton>
        </div>

        {/* Study by Topic — small card */}
        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-headline text-lg font-semibold text-on-surface">
              Study by Topic
            </h3>
            <Link
              to={TopicRoutes.list()}
              className="flex items-center gap-0.5 text-xs text-on-surface-variant transition-colors hover:text-primary"
            >
              All topics <ChevronRight className="size-3" />
            </Link>
          </div>

          {loadingTopics ? (
            <div className="flex flex-wrap gap-2">
              {[80, 100, 72, 90].map((w, i) => (
                <div
                  key={i}
                  className="h-8 animate-pulse rounded-full bg-surface-container-high"
                  style={{ width: w }}
                />
              ))}
            </div>
          ) : topics.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              No topics yet.{' '}
              <Link
                to={TopicRoutes.list()}
                className="text-primary underline underline-offset-4"
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
        </div>
      </div>

      <Separator />

      {/* ── Vocabulary ────────────────────────────────────────────── */}
      <section>
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