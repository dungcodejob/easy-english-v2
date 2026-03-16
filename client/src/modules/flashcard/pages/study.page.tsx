import { useState, useEffect, useCallback } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  Clock,
  Flame,
  Target,
  BookOpen,
  Keyboard,
} from 'lucide-react';
import { Button } from '@/shared/ui/shadcn/button';
import { Card, CardContent } from '@/shared/ui/shadcn/card';
import { Progress } from '@/shared/ui/shadcn/progress';
import {
  useDueCards,
  useStudyStats,
} from '../hooks/use-flashcards';
import { Spinner } from '@/shared/ui/shadcn/spinner';
import type { DueCard } from '../types';

export const Route = createFileRoute('/_(authenticated)/study')({
  component: StudyPage,
});

type StudyMode = 'practice' | 'review';

function StudyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showKeyboardHint, setShowKeyboardHint] = useState(true);
  const [studyMode, setStudyMode] = useState<StudyMode>('practice');
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    correct: 0,
    startTime: Date.now(),
  });

  const { data: dueCardsData, isLoading } = useDueCards(50);
  const { data: statsData } = useStudyStats();

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 blur-3xl rounded-full" />
          <div className="relative size-24 rounded-full bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 flex items-center justify-center">
            <Check className="size-12 text-green-500" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">{t('study.all_done') || 'All caught up!'}</h2>
          <p className="text-muted-foreground">
            {t('study.no_cards_due') || 'No cards are due for review right now.'}
          </p>
        </div>
        <Button onClick={() => navigate({ to: '/flashcards' })}>
          <BookOpen className="size-4 mr-2" />
          {t('study.go_to_cards') || 'Go to My Flashcards'}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)] gap-8 w-full max-w-3xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/flashcards' })}
          className="gap-2"
        >
          <ChevronLeft className="size-4" />
          {t('study.back') || 'Back'}
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            {sessionTime}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Flame className="size-4 text-orange-500" />
            <span>{sessionStats.reviewed}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{t('study.progress') || 'Progress'}</span>
          <span>{currentIndex + 1} / {cards.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <div className="relative w-full aspect-[4/3] max-w-lg">
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
              className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
                isFlipped ? '[transform:rotateY(180deg)]' : ''
              }`}
            >
              {/* Front */}
              <Card className="absolute inset-0 [backface-visibility:hidden] border-2 shadow-xl overflow-hidden">
                <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="absolute top-4 right-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      currentCard.source === 'custom'
                        ? 'bg-green-500/10 text-green-600'
                        : 'bg-blue-500/10 text-blue-600'
                    }`}>
                      {currentCard.source === 'custom' ? t('study.custom') || 'Custom' : t('study.learning') || 'Learning List'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-4 uppercase tracking-wider">
                    {t('study.question') || 'Question'}
                  </div>
                  <div className="text-3xl font-bold leading-relaxed">
                    {currentCard.front}
                  </div>
                  {currentCard.hint && (
                    <div className="mt-6 text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                      <span className="text-amber-500">💡</span>
                      {currentCard.hint}
                    </div>
                  )}
                  <div className="absolute bottom-4 text-sm text-muted-foreground">
                    {t('study.click_to_flip') || 'Click or press Space to reveal answer'}
                  </div>
                </CardContent>
              </Card>

              {/* Back */}
              <Card className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] border-2 border-primary/30 shadow-xl overflow-hidden bg-primary/5">
                <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="text-sm text-muted-foreground mb-4 uppercase tracking-wider">
                    {t('study.answer') || 'Answer'}
                  </div>
                  <div className="text-3xl font-bold leading-relaxed text-primary">
                    {currentCard.back}
                  </div>
                  <div className="absolute bottom-4 flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevious();
                      }}
                      disabled={currentIndex === 0}
                    >
                      <ChevronLeft className="size-4 mr-1" />
                      {t('study.previous') || 'Previous'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                    >
                      {currentIndex === cards.length - 1 ? (
                        <>
                          <Check className="size-4 mr-1" />
                          {t('study.finish') || 'Finish'}
                        </>
                      ) : (
                        <>
                          {t('study.next') || 'Next'}
                          <ChevronRight className="size-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
              className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-muted/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-3 text-sm"
            >
              <Keyboard className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                <kbd className="px-1.5 py-0.5 bg-background rounded text-xs font-mono">Space</kbd>
                {' '}flip
              </span>
              <span className="text-muted-foreground">
                <kbd className="px-1.5 py-0.5 bg-background rounded text-xs font-mono">←</kbd>
                <kbd className="px-1.5 py-0.5 bg-background rounded text-xs font-mono">→</kbd>
                {' '}navigate
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
              className={`w-2 h-2 rounded-full transition-all ${
                actualIndex === currentIndex
                  ? 'bg-primary w-6'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
