import { LearnRoutes } from '@/shared/constants';
import { useFilters } from '@/shared/hooks/use-filters';
import { DsButton, DsSpinner } from '@/shared/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { FlashcardView } from '../components/flashcard-view';
import { QuizView } from '../components/quiz-view';
import { RatingButtons } from '../components/rating-buttons';
import { SessionCompleteCard } from '../components/session-complete-card';
import { StudySessionLayout } from '../components/study-session-layout';
import { useCompleteSession } from '../hooks/use-complete-session';
import { useReviewCard } from '../hooks/use-review-card';
import { useSessionSummary } from '../hooks/use-session-summary';
import { useStartSession } from '../hooks/use-start-session';
import { useStudySessionStore } from '../stores/use-study-session-store';
import type {
  QuizCard,
  RatingValue,
  ReviewResult,
  StudyScope,
} from '../types/study.types';

const FEEDBACK_DURATION_MS = 800;

type StudySessionQueryParams = {
  sessionId?: string;
  completed?: string;
  mode?: 'due' | 'topic' | 'quiz';
  topicId?: string;
  index?: number;
  studyType?: 'FLASHCARD' | 'QUIZ';
};

export const Route = createFileRoute('/_(authenticated)/learning/study')({
  component: StudySessionPage,
  validateSearch: () => ({}) as Partial<StudySessionQueryParams>,
});

function StudySessionPage() {
  const navigate = useNavigate();

  const { filters } = useFilters(Route.id);

  // URL search params
  const sessionId = filters.sessionId;
  const completed = filters.completed === 'true';
  const mode = filters.mode || 'due';
  const topicId = filters.topicId;

  // Server session summary (for completed sessions)
  const { data: summaryData } = useSessionSummary(sessionId ?? '');

  const store = useStudySessionStore();
  const startMutation = useStartSession();
  const completeMutation = useCompleteSession();

  // Review card with optional sessionId context
  const reviewMutation = useReviewCard(sessionId);

  // Derived state
  const currentCard = store.cards[store.currentIndex];
  const isSessionComplete =
    store.currentIndex >= store.cards.length && store.cards.length > 0;

  // Show server summary if this is a completed navigation
  if (completed && sessionId) {
    const summary = summaryData?.data;
    if (summary) {
      return (
        <StudySessionLayout
          sessionType="Session Complete"
          current={store.reviewedCount}
          total={store.cards.length}
          progressPercent={100}
        >
          <SessionCompleteCard sessionSummary={summary} />
        </StudySessionLayout>
      );
    }
    // Summary still loading — show a spinner
    return (
      <StudySessionLayout sessionType="Session Complete">
        <div className="flex min-h-[60vh] items-center justify-center">
          <DsSpinner size="lg" className="text-muted-foreground" />
        </div>
      </StudySessionLayout>
    );
  }

  // If we have a sessionId in URL but no cards loaded yet, start the session
  // This handles page refresh mid-session (URL resumption)
  const [pendingAutoStart, setPendingAutoStart] = useState(false);

  const handleExit = useCallback(() => {
    const hasActiveSession =
      store.cards.length > 0 && !isSessionComplete && store.currentIndex > 0;
    if (
      hasActiveSession &&
      !window.confirm('Exit session? Your progress so far will not be saved.')
    ) {
      return;
    }
    store.resetSession();
    navigate({ to: LearnRoutes.base() });
  }, [store, navigate, isSessionComplete]);

  const handleQuizAnswer = async (
    wordSenseId: string,
    rating: 1 | 2 | 3 | 4,
  ) => {
    const startedAt = store.startedAt ?? Date.now();
    const reviewDurationMs = Date.now() - startedAt;
    await reviewMutation.mutateAsync({ wordSenseId, rating, reviewDurationMs });
    store.recordRating(rating);
  };

  const handleQuizComplete = () => {
    if (store.sessionId) {
      store.finishSession();
      store.setSessionCompleted();
      completeMutation.mutate(store.sessionId);
    }
  };

  // Quiz mode — render QuizView
  if (mode === 'quiz' && store.cards.length > 0) {
    return (
      <StudySessionLayout
        sessionType="Quiz"
        current={store.currentIndex + 1}
        total={store.cards.length}
        progressPercent={store.cards.length > 0 ? ((store.currentIndex + 1) / store.cards.length) * 100 : 0}
        onExit={handleExit}
      >
        <QuizView
          cards={store.cards as QuizCard[]}
          sessionId={sessionId!}
          onComplete={handleQuizComplete}
          onAnswer={handleQuizAnswer}
        />
      </StudySessionLayout>
    );
  }

  useEffect(() => {
    if (!sessionId || store.sessionId === sessionId) return;
    if (store.cards.length > 0) return; // Already have cards

    // Trigger start — server will return the enrolled card set
    setPendingAutoStart(true);
    const scope: StudyScope = mode === 'topic' && topicId ? 'TOPIC' : 'DUE';
    startMutation.mutate(
      { scope, topicId, studyType: mode === 'quiz' ? 'QUIZ' : 'FLASHCARD' },
      {
        onSettled: () => setPendingAutoStart(false),
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, mode, topicId]);

  const handleRate = useCallback(
    async (rating: RatingValue) => {
      if (store.isSubmittingRating || !store.flipped) return;
      if (!currentCard) return;

      const startedAt = store.startedAt ?? Date.now();
      const reviewDurationMs = Date.now() - startedAt;

      store.setSubmittingRating(true);
      store.recordRating(rating);

      try {
        const result = await reviewMutation.mutateAsync({
          wordSenseId: currentCard.wordSenseId,
          rating,
          reviewDurationMs,
        });
        setFeedback(result);
        setTimeout(() => {
          setFeedback(null);
          store.goNext();
          store.setSubmittingRating(false);

          if (store.currentIndex >= store.cards.length) {
            // All cards reviewed — call complete and redirect to summary
            if (store.sessionId) {
              store.finishSession();
              store.setSessionCompleted();
              completeMutation.mutate(store.sessionId);
            } else {
              store.finishSession();
            }
          }
        }, FEEDBACK_DURATION_MS);
      } catch {
        store.setSubmittingRating(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentCard, store],
  );

  const [feedback, setFeedback] = useState<ReviewResult | null>(null);

  // Loading states
  if (startMutation.isPending || pendingAutoStart) {
    return (
      <StudySessionLayout sessionType="Loading...">
        <div className="flex min-h-[60vh] items-center justify-center">
          <DsSpinner size="lg" className="text-muted-foreground" />
        </div>
      </StudySessionLayout>
    );
  }

  // No cards (empty due/topic set)
  if (store.cards.length === 0 && !sessionId) {
    return (
      <StudySessionLayout sessionType={mode === 'topic' ? 'Topic Study' : 'Daily Review'}>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold">All caught up!</h2>
            <p className="text-muted-foreground">
              {mode === 'topic'
                ? 'No cards to study in this topic yet.'
                : 'No cards are due for review right now.'}
            </p>
          </div>
          <DsButton onClick={() => navigate({ to: LearnRoutes.base() })}>
            Back to My Learning
          </DsButton>
        </div>
      </StudySessionLayout>
    );
  }

  // Session complete (non-redirect path — e.g. completed session still in store)
  if (isSessionComplete && !completed) {
    return (
      <StudySessionLayout
        sessionType="Session Complete"
        current={store.reviewedCount}
        total={store.cards.length}
        progressPercent={100}
      >
        <SessionCompleteCard
          sessionSummary={undefined}
          reviewedCount={store.reviewedCount}
          correctLikeCount={
            store.ratingBreakdown.good + store.ratingBreakdown.easy
          }
          elapsedMs={store.elapsedMs}
        />
      </StudySessionLayout>
    );
  }

  return (
    <StudySessionLayout
      sessionType={mode === 'topic' ? 'Topic Study' : mode === 'quiz' ? 'Quiz' : 'Daily Review'}
      current={store.currentIndex + 1}
      total={store.cards.length}
      progressPercent={store.cards.length > 0 ? ((store.currentIndex + 1) / store.cards.length) * 100 : 0}
      onExit={handleExit}
    >
      <div className="relative w-full max-w-3xl mx-auto flex flex-col items-center gap-8">
        {/* Card */}
        {currentCard && (
          <div className="relative w-full">
            <FlashcardView
              card={currentCard}
              flipped={store.flipped}
              onFlip={store.flipCard}
            />

            {/* Feedback overlay */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  key="feedback"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center rounded-2xl bg-surface/80 backdrop-blur-sm"
                >
                  <div className="text-center">
                    <p className="text-sm font-medium text-on-surface-variant opacity-80">Next review</p>
                    <p className="text-xl font-bold font-headline text-primary tabular-nums">
                      {feedback.nextDueDate
                        ? new Date(feedback.nextDueDate).toLocaleDateString()
                        : 'Now'}
                    </p>
                    <p className="text-xs text-on-surface-variant opacity-60 mt-1">
                      {feedback.intervalDays} day
                      {feedback.intervalDays !== 1 ? 's' : ''}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Flip / Rating */}
        {!store.flipped ? (
          <button
            type="button"
            onClick={store.flipCard}
            className="bg-gradient-to-br from-primary to-primary-container text-white rounded-full px-8 py-3 font-headline font-bold shadow-lg w-full max-w-sm"
          >
            Show Answer
          </button>
        ) : (
          <RatingButtons
            disabled={store.isSubmittingRating}
            onRate={handleRate}
          />
        )}
      </div>
    </StudySessionLayout>
  );
}
