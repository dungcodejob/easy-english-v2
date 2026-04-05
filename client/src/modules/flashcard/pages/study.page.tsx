/**
 * StudyPage — Flashcard module
 *
 * UI: Standard components delegated to DS.
 * 3D flip card: raw HTML (no DS abstraction needed — it's a one-off animation).
 * Business logic: unchanged.
 */

import { useCallback, useEffect, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Keyboard,
} from 'lucide-react';

import { DsButton, DsCard, DsProgress } from '@/shared/ui';
import {
  useDueCards,
} from '../hooks/use-flashcards';

export const Route = createFileRoute('/_(authenticated)/flashcards/study')({
  component: StudyPage,
});

function StudyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showKeyboardHint, setShowKeyboardHint] = useState(true);
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    startTime: Date.now(),
  });

  const { data: dueCardsData, isLoading } = useDueCards(50);

  const cards = dueCardsData?.data ?? [];
  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

  // Hide keyboard hint after first interaction
  useEffect(() => {
    if (!showKeyboardHint) return;
    const timer = setTimeout(() => setShowKeyboardHint(false), 5000);
    return () => clearTimeout(timer);
  }, [showKeyboardHint]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowRight' && isFlipped) {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'Escape') {
        navigate({ to: '/flashcards' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, currentIndex, cards.length, navigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setSessionStats((prev) => ({ ...prev, reviewed: prev.reviewed + 1 }));
    }
  }, [currentIndex, cards.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const sessionTime = formatTime(Date.now() - sessionStats.startTime);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <svg
          className="size-8 animate-spin text-muted-foreground"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 blur-3xl" />
          <div className="relative flex size-24 items-center justify-center rounded-full border border-green-500/20 bg-gradient-to-br from-green-500/10 to-blue-500/10">
            <Check className="size-12 text-green-500" />
          </div>
        </div>
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold">
            {t('study.all_done') || 'All caught up!'}
          </h2>
          <p className="text-muted-foreground">
            {t('study.no_cards_due') || 'No cards are due for review right now.'}
          </p>
        </div>
        <DsButton leftIcon={<BookOpen />} onClick={() => navigate({ to: '/flashcards' })}>
          {t('study.go_to_cards') || 'Go to My Flashcards'}
        </DsButton>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-180px)] w-full max-w-3xl flex-col items-center justify-center gap-8 py-8 mx-auto">
      {/* Header */}
      <div className="flex w-full items-center justify-between">
        <DsButton
          variant="ghost"
          size="sm"
          leftIcon={<ChevronLeft />}
          onClick={() => navigate({ to: '/flashcards' })}
        >
          {t('study.back') || 'Back'}
        </DsButton>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            {sessionTime}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Flame className="size-4 text-orange-500" />
            {sessionStats.reviewed}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{t('study.progress') || 'Progress'}</span>
          <span>
            {currentIndex + 1} / {cards.length}
          </span>
        </div>
        <DsProgress value={progress} size="sm" />
      </div>

      {/* Flashcard */}
      <div className="relative aspect-[4/3] w-full max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 cursor-pointer"
            onClick={handleFlip}
          >
            <div
              className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${
                isFlipped ? '[transform:rotateY(180deg)]' : ''
              }`}
            >
              {/* Front */}
              <FlashcardFace
                isFlipped={false}
                source={currentCard.source}
                content={currentCard.front}
                hint={currentCard.hint}
                label={t('study.question') || 'Question'}
                hintLabel={t('study.click_to_flip') || 'Click or press Space to reveal answer'}
              />

              {/* Back */}
              <FlashcardFace
                isFlipped={true}
                source={currentCard.source}
                content={currentCard.back}
                label={t('study.answer') || 'Answer'}
                onNext={handleNext}
                onPrevious={handlePrevious}
                isFirst={currentIndex === 0}
                isLast={currentIndex === cards.length - 1}
                flipLabel={t('study.next') || 'Next'}
                finishLabel={t('study.finish') || 'Finish'}
                prevLabel={t('study.previous') || 'Previous'}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Keyboard hint overlay */}
        <AnimatePresence>
          {showKeyboardHint && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-muted/90 px-4 py-2 text-sm backdrop-blur-sm"
            >
              <Keyboard className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                <kbd className="rounded bg-background px-1.5 py-0.5 font-mono text-xs">Space</kbd>{' '}
                flip
              </span>
              <span className="text-muted-foreground">
                <kbd className="rounded bg-background px-1.5 py-0.5 font-mono text-xs">&#8592;</kbd>
                <kbd className="rounded bg-background px-1.5 py-0.5 font-mono text-xs">&#8594;</kbd>{' '}
                navigate
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation dots */}
      <div className="flex gap-2">
        {cards.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, i) => {
          const actualIndex = Math.max(0, currentIndex - 2) + i;
          return (
            <button
              key={actualIndex}
              onClick={() => {
                setCurrentIndex(actualIndex);
                setIsFlipped(false);
              }}
              className={`h-2 w-2 rounded-full transition-all ${
                actualIndex === currentIndex
                  ? 'w-6 bg-primary'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────────── */

function FlashcardFace({
  isFlipped,
  source,
  content,
  hint,
  label,
  hintLabel,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  flipLabel,
  finishLabel,
  prevLabel,
}: {
  isFlipped: boolean;
  source: string;
  content: string;
  hint?: string;
  label: string;
  hintLabel?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  flipLabel?: string;
  finishLabel?: string;
  prevLabel?: string;
}) {
  return (
    <DsCard
      className={`absolute inset-0 overflow-hidden border-2 shadow-xl ${
        isFlipped ? 'border-primary/30 bg-primary/5' : ''
      }`}
    >
      <DsCard.Content className="flex h-full flex-col items-center justify-center p-8 text-center">
        {/* Source badge */}
        <div className="absolute right-4 top-4">
          <span
            className={`rounded-full px-2 py-1 text-xs ${
              source === 'custom'
                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
            }`}
          >
            {source === 'custom'
              ? 'Custom'
              : 'Learning List'}
          </span>
        </div>

        {/* Label */}
        <div className="mb-4 text-sm uppercase tracking-wider text-muted-foreground">
          {label}
        </div>

        {/* Content */}
        <div
          className={`text-3xl font-bold leading-relaxed ${isFlipped ? 'text-primary' : ''}`}
        >
          {content}
        </div>

        {/* Hint */}
        {hint && !isFlipped && (
          <div className="mt-6 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
            <span>&#128161;</span>
            {hint}
          </div>
        )}

        {/* Navigation buttons (back face only) */}
        {isFlipped && onNext && (
          <div className="absolute bottom-4 flex items-center gap-4">
            <DsButton
              variant="outline"
              size="sm"
              leftIcon={<ChevronLeft />}
              onClick={(e) => {
                e.stopPropagation();
                onPrevious?.();
              }}
              disabled={isFirst}
            >
              {prevLabel || 'Previous'}
            </DsButton>
            <DsButton
              size="sm"
              rightIcon={<ChevronRight />}
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
            >
              {isLast ? finishLabel || 'Finish' : flipLabel || 'Next'}
            </DsButton>
          </div>
        )}

        {/* Flip hint (front face only) */}
        {!isFlipped && (
          <div className="absolute bottom-4 text-sm text-muted-foreground">
            {hintLabel}
          </div>
        )}
      </DsCard.Content>
    </DsCard>
  );
}
