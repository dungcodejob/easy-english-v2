import { useTopics } from '@/modules/topic/hooks/use-topics';
import { LearnRoutes, TopicRoutes } from '@/shared/constants';
import { DsBadge, DsButton } from '@/shared/ui';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/shadcn/tabs';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { BookMarked, BookOpen, Play, Zap } from 'lucide-react';
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
  const { data: topicsData, isLoading: loadingTopics } = useTopics(1, 6);
  const [studyType, setStudyType] = useState<'FLASHCARD' | 'QUIZ'>('FLASHCARD');
  const startMutation = useStartSession();

  const dueCount = dueData?.data?.total ?? 0;
  const topics = topicsData?.data?.data ?? [];

  const handleStartReview = () => {
    startMutation.mutate({ scope: 'DUE', studyType });
  };

  const handleStudyTopic = (topicId: string) => {
    navigate({
      to: LearnRoutes.study(),
      search: { mode: 'topic', topicId, index: 0 },
    });
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-16">
      <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20">
            <BookMarked className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              My Learning
            </h1>
            <p className="mt-2 text-muted-foreground text-lg text-balance">
              Review and track the vocabulary you are actively learning.
            </p>
          </div>
        </div>
      </div>

      {/* Study entry section */}
      <section className="mb-10 grid gap-6 sm:grid-cols-2 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 fill-mode-both">
        {/* Start Review */}
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                <Zap className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Start Review</h2>
                <p className="text-sm text-muted-foreground">
                  Review all due cards now
                </p>
              </div>
            </div>
            <Tabs
              value={studyType}
              onValueChange={(v) => setStudyType(v as 'FLASHCARD' | 'QUIZ')}
            >
              <TabsList className="h-8">
                <TabsTrigger value="FLASHCARD" className="text-xs px-3">
                  Flashcard
                </TabsTrigger>
                <TabsTrigger value="QUIZ" className="text-xs px-3">
                  Quiz
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center justify-between">
            <div>
              {loadingDue ? (
                <span className="text-3xl font-extrabold text-muted-foreground tabular-nums">
                  —
                </span>
              ) : (
                <span className="text-3xl font-extrabold text-foreground tabular-nums">
                  {dueCount}
                </span>
              )}
              <span className="ml-2 text-sm text-muted-foreground">cards due</span>
            </div>
            <DsButton
              leftIcon={<Play className="size-4" />}
              onClick={handleStartReview}
              disabled={loadingDue || dueCount === 0}
            >
              {dueCount > 0 ? 'Start Review' : 'All caught up'}
            </DsButton>
          </div>
        </div>

        {/* Study by Topic */}
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <BookMarked className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Study by Topic
              </h2>
              <p className="text-sm text-muted-foreground">
                Practice words from a specific topic
              </p>
            </div>
          </div>

          {loadingTopics ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 w-full animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          ) : topics.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No topics yet.{' '}
              <a
                href={TopicRoutes.list()}
                className="underline underline-offset-2"
              >
                Create one
              </a>{' '}
              to start studying.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <DsButton
                  key={topic.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleStudyTopic(topic.id)}
                  className="gap-1.5"
                >
                  {topic.name}
                  <DsBadge variant="secondary" className="ml-1 text-xs">
                    Study
                  </DsBadge>
                </DsButton>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Vocabulary list */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            Your Vocabulary
          </h2>
        </div>
        <LearningList page={page} onPageChange={setPage} />
      </div>
    </div>
  );
}
