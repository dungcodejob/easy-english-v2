import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { StudyProgress } from './study-progress';
import type { QuizCard } from '../types/study.types';

interface QuizViewProps {
  cards: QuizCard[];
  sessionId: string;
  onComplete: () => void;
  onAnswer: (wordSenseId: string, rating: 1 | 2 | 3 | 4) => Promise<void>;
}

type QuizState = 'selecting' | 'answered';

export function QuizView({ cards, sessionId: _sessionId, onComplete, onAnswer }: QuizViewProps) {
  // sessionId kept for future session-aware features
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizState, setQuizState] = useState<QuizState>('selecting');
  const [selectedLabel, setSelectedLabel] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use refs for stable function references to avoid exhaustive-deps warnings
  const onCompleteRef = useRef(onComplete);
  const onAnswerRef = useRef(onAnswer);
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onAnswerRef.current = onAnswer;
  });

  const currentCard = cards[currentIndex];
  const isLastCard = currentIndex >= cards.length - 1;

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const handleSelectOption = (label: 'A' | 'B' | 'C' | 'D') => {
    if (quizState !== 'selecting') return;
    setSelectedLabel(label);
    setQuizState('answered');

    const correct = label === currentCard.correctAnswer;
    const rating: 1 | 2 | 3 | 4 = correct ? 3 : 1;
    onAnswerRef.current(currentCard.wordSenseId, rating).catch(() => {});
  };

  const advance = () => {
    setQuizState('selecting');
    setSelectedLabel(null);

    if (isLastCard) {
      onCompleteRef.current();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  // Auto-advance after 1200ms feedback
  useEffect(() => {
    if (quizState !== 'answered') return;

    feedbackTimerRef.current = setTimeout(() => {
      advance();
    }, 1200);

    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
    // advance is stable — intentionally omitted from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizState, currentIndex]);

  // Keyboard shortcuts: 1/2/3/4 → A/B/C/D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (quizState !== 'selecting') return;
      const keyMap: Record<string, 'A' | 'B' | 'C' | 'D'> = {
        '1': 'A', '2': 'B', '3': 'C', '4': 'D',
      };
      const label = keyMap[e.key];
      if (label) handleSelectOption(label);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // handleSelectOption is stable — intentionally omitted from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizState]);

  const isCorrect = selectedLabel === currentCard.correctAnswer;

  if (cards.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold">No cards due for quiz</h2>
          <p className="text-muted-foreground">Come back later!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-180px)] w-full flex-col items-center justify-center gap-8 py-8 px-4">
      {/* Header with progress */}
      <div className="flex w-full items-center justify-between">
        <div className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">
          Quiz Mode
        </div>
        <StudyProgress current={currentIndex + 1} total={cards.length} />
        <div className="w-16" />
      </div>

      {/* Question */}
      <div className="text-center">
        <h2 className="font-headline text-4xl font-bold text-primary text-center mb-4">
          {currentCard.question}
        </h2>
        <p className="text-lg text-on-surface-variant text-center mb-8 italic">
          {currentCard.partOfSpeech}
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
        {currentCard.options.map((option) => {
          const isSelected = option.label === selectedLabel;
          const isCorrectOption = option.label === currentCard.correctAnswer;
          const showAsCorrect = quizState === 'answered' && isCorrectOption;
          const showAsWrong = quizState === 'answered' && isSelected && !isCorrectOption;
          const dimmed = quizState === 'answered' && !isSelected && !isCorrectOption;

          let optionClass =
            'rounded-2xl border-2 p-4 text-left transition-all bg-surface-container hover:bg-surface-container-high flex items-start gap-3 cursor-pointer';

          if (showAsCorrect) {
            optionClass += ' border-green-500 bg-green-50 dark:bg-green-950/30';
          } else if (showAsWrong) {
            optionClass += ' border-red-500 bg-red-50 dark:bg-red-950/30';
          } else if (dimmed) {
            optionClass += ' border-outline text-on-surface-variant opacity-50';
          } else if (quizState === 'selecting') {
            optionClass += ' border-outline-variant hover:border-primary cursor-pointer';
          } else {
            optionClass += ' border-outline bg-surface-container';
          }

          return (
            <motion.button
              key={option.label}
              type="button"
              onClick={() => handleSelectOption(option.label)}
              disabled={quizState !== 'selecting'}
              className={optionClass}
              whileTap={quizState === 'selecting' ? { scale: 0.98 } : undefined}
            >
              {/* Label badge */}
              <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                showAsCorrect
                  ? 'bg-green-500 text-white'
                  : showAsWrong
                  ? 'bg-red-500 text-white'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}>
                {option.label}
              </span>

              {/* Option text */}
              <span className={`flex-1 text-sm leading-relaxed ${
                showAsCorrect ? 'text-green-700 dark:text-green-400' :
                showAsWrong ? 'text-red-700 dark:text-red-400' :
                'text-on-surface'
              }`}>
                {option.text}
              </span>

              {/* Icon */}
              {showAsCorrect && <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />}
              {showAsWrong && <XCircle className="h-5 w-5 shrink-0 text-red-500" />}
            </motion.button>
          );
        })}
      </div>

      {/* Feedback banner */}
      <AnimatePresence>
        {quizState === 'answered' && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className={`w-full max-w-md rounded-2xl p-4 text-center ${
              isCorrect
                ? 'bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800'
            }`}
          >
            {isCorrect ? (
              <div>
                <p className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400 font-bold">
                  <CheckCircle2 className="h-5 w-5" />
                  Correct!
                </p>
                <p className="mt-1 text-sm text-green-600 dark:text-green-500">
                  Auto-advancing...
                </p>
              </div>
            ) : (
              <div>
                <p className="flex items-center justify-center gap-2 text-red-700 dark:text-red-400 font-bold">
                  <XCircle className="h-5 w-5" />
                  Incorrect
                </p>
                <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                  Correct: {currentCard.correctAnswer} — {currentCard.options.find(o => o.label === currentCard.correctAnswer)?.text.split(' — ')[0]}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
