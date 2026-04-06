import { LearnRoutes } from '@/shared/constants';
import { useFilters } from '@/shared/hooks/use-filters';
import { DsButton } from '@/shared/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ChevronLeft, Clock } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { FlashcardView } from '../components/flashcard-view';
import { QuizView } from '../components/quiz-view';
import { RatingButtons } from '../components/rating-buttons';
import { SessionCompleteCard } from '../components/session-complete-card';
import { StudyProgress } from '../components/study-progress';
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

  const { filters, setSearch } = useFilters(Route.id);

  // URL search params
  const sessionId = filters.sessionId;
  const completed = filters.completed === 'true';
  const mode = filters.mode || 'due';
  const studyType = filters.studyType || 'FLASHCARD';
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
      return <SessionCompleteCard sessionSummary={summary} />;
    }
    // Summary still loading — show a spinner
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <svg
          className="size-8 animate-spin text-muted-foreground"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  // If we have a sessionId in URL but no cards loaded yet, start the session
  // This handles page refresh mid-session (URL resumption)
  const [pendingAutoStart, setPendingAutoStart] = useState(false);

  // Quiz mode — render QuizView
  if (mode === 'quiz' && store.cards.length > 0) {
    return (
      <QuizView
        cards={store.cards as QuizCard[]}
        sessionId={sessionId!}
        onComplete={handleQuizComplete}
        onAnswer={handleQuizAnswer}
      />
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

  const [feedback, setFeedback] = useState<ReviewResult | null>(null);

  // Loading states
  if (startMutation.isPending || pendingAutoStart) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <svg
          className="size-8 animate-spin text-muted-foreground"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  // No cards (empty due/topic set)
  if (store.cards.length === 0 && !sessionId) {
    return (
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
    );
  }

  // Session complete (non-redirect path — e.g. completed session still in store)
  if (isSessionComplete && !completed) {
    return (
      <SessionCompleteCard
        sessionSummary={undefined}
        reviewedCount={store.reviewedCount}
        correctLikeCount={
          store.ratingBreakdown.good + store.ratingBreakdown.easy
        }
        elapsedMs={store.elapsedMs}
      />
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-180px)] w-full max-w-3xl flex-col items-center justify-center gap-8 py-8 mx-auto px-4">
      {/* Header */}
      <div className="flex w-full items-center justify-between">
        <DsButton
          variant="ghost"
          size="sm"
          leftIcon={<ChevronLeft className="size-4" />}
          onClick={handleExit}
        >
          Exit
        </DsButton>
        <StudyProgress
          current={store.currentIndex + 1}
          total={store.cards.length}
        />
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" />
          <span>Space to flip</span>
        </div>
      </div>

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
                className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm"
              >
                <div className="text-center text-white">
                  <p className="text-sm font-medium opacity-80">Next review</p>
                  <p className="text-xl font-extrabold tabular-nums">
                    {feedback.nextDueDate
                      ? new Date(feedback.nextDueDate).toLocaleDateString()
                      : 'Now'}
                  </p>
                  <p className="text-xs opacity-60 mt-1">
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
        <DsButton
          variant="outline"
          className="w-full max-w-xs"
          onClick={store.flipCard}
        >
          Show Answer
        </DsButton>
      ) : (
        <RatingButtons
          disabled={store.isSubmittingRating}
          onRate={handleRate}
        />
      )}
    </div>
  );
}
