import { AnimatePresence, motion } from 'motion/react';
import type { StudyCard } from '../../types/study.types';

interface FlashcardViewProps {
  card: StudyCard;
  flipped: boolean;
  onFlip: () => void;
}

export function FlashcardView({ card, flipped, onFlip }: FlashcardViewProps) {
  return (
    <div
      className="relative w-full cursor-pointer select-none"
      onClick={onFlip}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onFlip();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={
        flipped ? 'Card back — click to flip' : 'Card front — click to flip'
      }
    >
      <AnimatePresence mode="wait">
        {!flipped ? (
          <motion.div
            key="front"
            initial={{ rotateY: -180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -180, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="flex min-h-[260px] w-full flex-col items-center justify-center rounded-2xl border border-outline-variant/20 bg-surface-container p-8 shadow-sm"
          >
            <span className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
              {card.hint}
            </span>
            <span className="font-headline text-4xl font-bold text-primary text-center">
              {card.front}
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ rotateY: 180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 180, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="flex min-h-[260px] w-full flex-col items-center justify-center rounded-2xl border border-outline-variant/20 bg-surface-container p-8 shadow-sm gap-4"
          >
            <span className="font-headline text-2xl font-bold text-on-surface text-center">
              {card.back.definition}
            </span>
            {card.back.example && (
              <span className="text-base italic text-on-surface-variant text-center">
                {card.back.example}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
