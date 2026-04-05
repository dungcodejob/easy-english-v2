import { useTopics } from '@/modules/topic/hooks/use-topics';
import { LearnRoutes, TopicRoutes } from '@/shared/constants';
import { DsBadge, DsButton } from '@/shared/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { BookMarked, Play, Zap } from 'lucide-react';
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
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
              <Zap className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Start Review
              </h2>
              <p className="text-sm text-muted-foreground">
                Review all due cards now
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Mode:</span>
                <div className="inline-flex rounded-lg border border-border bg-muted p-0.5">
                  <button
                    type="button"
                    onClick={() => setStudyType('FLASHCARD')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      studyType === 'FLASHCARD'
                        ? 'bg-background text-foreground shadow-sm font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Flashcard
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudyType('QUIZ')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      studyType === 'QUIZ'
                        ? 'bg-background text-foreground shadow-sm font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-end justify-between">
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
              <span className="ml-2 text-sm text-muted-foreground">
                cards due
              </span>
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

      {/* Existing learning list */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
        <LearningList page={page} onPageChange={setPage} />
      </div>
    </div>
  );
}
