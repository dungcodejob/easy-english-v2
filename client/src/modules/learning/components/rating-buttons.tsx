import { DsButton } from '@/shared/ui';
import type { RatingValue } from '../types/study.types';

const RATING_CONFIG: Array<{
  rating: RatingValue;
  label: string;
  shortcut: string;
  variant: 'destructive' | 'secondary' | 'default' | 'outline';
}> = [
  { rating: 1, label: 'Again', shortcut: '1', variant: 'destructive' },
  { rating: 2, label: 'Hard', shortcut: '2', variant: 'secondary' },
  { rating: 3, label: 'Good', shortcut: '3', variant: 'default' },
  { rating: 4, label: 'Easy', shortcut: '4', variant: 'outline' },
];

interface RatingButtonsProps {
  disabled: boolean;
  onRate: (rating: RatingValue) => void;
}

export function RatingButtons({ disabled, onRate }: RatingButtonsProps) {
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:gap-2">
      {RATING_CONFIG.map(({ rating, label, shortcut, variant }) => (
        <DsButton
          key={rating}
          variant={variant}
          className="flex-1 text-base font-semibold py-6 shadow-sm"
          onClick={() => onRate(rating)}
          disabled={disabled}
          aria-label={`Rate ${label} (shortcut ${shortcut})`}
        >
          <span className="flex flex-col items-center gap-0.5">
            <span>{label}</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground opacity-70">
              {shortcut}
            </kbd>
          </span>
        </DsButton>
      ))}
    </div>
  );
}
