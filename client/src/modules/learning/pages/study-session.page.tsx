import { useEffect, useState } from 'react';
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, Clock } from 'lucide-react';
import { APP_ROUTES } from '@/shared/constants';
import { DsButton } from '@/shared/ui';
import { useDueCards } from '../hooks/use-due-cards';
import { useTopicCards } from '../hooks/use-topic-cards';
import { useReviewCard } from '../hooks/use-review-card';
import { useStudySessionStore } from '../stores/use-study-session-store';
import { FlashcardView } from '../components/flashcard-view';
import { RatingButtons } from '../components/rating-buttons';
import { StudyProgress } from '../components/study-progress';
import { SessionCompleteCard } from '../components/session-complete-card';
import type { ReviewResult } from '../types/study.types';

const FEEDBACK_DURATION_MS = 800;

export const Route = createFileRoute('/_(authenticated)/learning/study')({
  component: StudySessionPage,
});

type Rating = 1 | 2 | 3 | 4;

function StudySessionPage() {
  const navigate = useNavigate();
  const search = useSearch<typeof Route['useSearch']>();

  const mode = (search.mode as 'due' | 'topic') || 'due';
  const topicId = search.topicId as string | undefined;

  const [showKeyboardHint, setShowKeyboardHint] = useState(true);
  const [feedback, setFeedback] = useState<ReviewResult | null>(null);

  const store = useStudySessionStore();
  const reviewMutation = useReviewCard();

  const { data: dueData, isLoading: loadingDue } = useDueCards();
  const { data: topicData, isLoading: loadingTopic, isError: topicError } = useTopicCards(
    mode === 'topic' ? (topicId ?? null) : null,
  );

  // Determine which data source and start session once loaded
  const isLoading = mode === 'topic' ? loadingTopic : loadingDue;
  const cards = mode === 'topic'
    ? (topicData?.data?.cards ?? [])
    : (dueData?.data?.cards ?? []);
  const dataTopicId = topicData?.data?.topicId;

  // Start session when cards are loaded
  useEffect(() => {
    if (isLoading || store.cards.length > 0) return;
    if (cards.length === 0) return;
    store.startSession(cards, mode, topicId ?? dataTopicId ?? undefined);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, cards.length]);

  // Hide keyboard hint after first interaction
  useEffect(() => {
    if (!showKeyboardHint) return;
    const timer = setTimeout(() => setShowKeyboardHint(false), 5000);
    return () => clearTimeout(timer);
  }, [showKeyboardHint]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === ' ') {
        e.preventDefault();
        store.flipCard();
        setShowKeyboardHint(false);
      } else if (e.key === '1') { e.preventDefault(); handleRate(1); }
      else if (e.key === '2') { e.preventDefault(); handleRate(2); }
      else if (e.key === '3') { e.preventDefault(); handleRate(3); }
      else if (e.key === '4') { e.preventDefault(); handleRate(4); }
      else if (e.key === 'Escape') {
        e.preventDefault();
        store.resetSession();
        navigate({ to: APP_ROUTES.LEARN });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.flipped, store.isSubmittingRating]);

  const handleRate = async (rating: Rating) => {
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
          store.finishSession();
        }
      }, FEEDBACK_DURATION_MS);
    } catch {
      store.setSubmittingRating(false);
    }
  };

  const currentCard = store.cards[store.currentIndex];
  const isSessionComplete = store.currentIndex >= store.cards.length && store.cards.length > 0;

  // Topic error redirect
  useEffect(() => {
    if (topicError && mode === 'topic') {
      store.resetSession();
      navigate({ to: APP_ROUTES.LEARN });
    }
  }, [topicError, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <svg className="size-8 animate-spin text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (cards.length === 0) {
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
        <DsButton onClick={() => navigate({ to: APP_ROUTES.LEARN })}>
          Back to My Learning
        </DsButton>
      </div>
    );
  }

  if (isSessionComplete) {
    return (
      <SessionCompleteCard
        reviewedCount={store.reviewedCount}
        correctLikeCount={store.correctLikeCount}
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
          onClick={() => {
            store.resetSession();
            navigate({ to: APP_ROUTES.LEARN });
          }}
        >
          Exit
        </DsButton>
        <StudyProgress current={store.currentIndex + 1} total={store.cards.length} />
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
                    {feedback.intervalDays} day{feedback.intervalDays !== 1 ? 's' : ''}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Flip button (when not flipped) */}
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
