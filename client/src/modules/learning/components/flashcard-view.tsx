import { AnimatePresence, motion } from 'motion/react';
import type { StudyCard } from '../types/study.types';

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
      aria-label={flipped ? 'Card back — click to flip' : 'Card front — click to flip'}
    >
      <AnimatePresence mode="wait">
        {!flipped ? (
          <motion.div
            key="front"
            initial={{ rotateY: -180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -180, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="flex min-h-[260px] w-full flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 shadow-sm ring-1 ring-border/50"
          >
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
              {card.hint}
            </span>
            <span className="text-center text-4xl font-extrabold tracking-tight text-foreground">
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
            className="flex min-h-[260px] w-full flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 shadow-sm ring-1 ring-border/50 gap-4"
          >
            <span className="text-center text-2xl font-bold text-foreground">
              {card.back.definition}
            </span>
            {card.back.example && (
              <span className="text-center text-base italic text-muted-foreground">
                {card.back.example}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
