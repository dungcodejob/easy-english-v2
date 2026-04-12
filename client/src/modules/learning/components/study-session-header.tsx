import { X } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { LearnRoutes } from '@/shared/constants';
import { Button } from '@/shared/ui/shadcn/button';

interface StudySessionHeaderProps {
  workspaceName?: string;
  sessionType?: string;
  streak?: number;
  timer?: string;
  current?: number;
  total?: number;
  progressPercent?: number;
  onExit?: () => void;
}

export function StudySessionHeader({
  workspaceName = 'Scholarly Sanctuary',
  sessionType,
  streak = 0,
  timer = '00:00',
  current = 0,
  total = 0,
  progressPercent = 0,
  onExit,
}: StudySessionHeaderProps) {
  const navigate = useNavigate();

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      navigate({ to: LearnRoutes.base() });
    }
  };

  return (
    <header className="w-full px-6 py-4 flex flex-col gap-4 sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-4">
        {/* Top row: close + workspace + stats */}
        <div className="flex justify-between items-center gap-4">
          {/* Left: exit + workspace */}
          <div className="flex items-center gap-4">
            <Button
              aria-label="Close study session"
              variant="ghost"
              size="icon"
              onClick={handleExit}
              className="w-10 h-10 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
            <span className="font-headline font-bold text-lg text-primary hidden sm:block">
              {workspaceName}
            </span>
          </div>

          {/* Right: stats */}
          <div className="flex items-center gap-3">
            {/* Streak */}
            {streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 font-headline font-bold text-sm">
                <span>🔥</span>
                <span>{streak}</span>
              </div>
            )}

            {/* Session type */}
            {sessionType && (
              <div className="hidden md:flex items-center gap-2 text-on-surface-variant font-label text-sm font-medium">
                <span>🎓</span>
                <span>Session: {sessionType}</span>
              </div>
            )}

            {/* Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface font-headline font-semibold text-sm">
              <span>⏱</span>
              <span>{timer}</span>
            </div>
          </div>
        </div>

        {/* Progress row */}
        {total > 0 && (
          <div className="w-full flex items-center gap-4">
            <div
              role="progressbar"
              aria-valuenow={current}
              aria-valuemin={0}
              aria-valuemax={total}
              aria-label={`Progress: ${current} of ${total}`}
              className="flex-1 h-2.5 bg-surface-container-highest rounded-full overflow-hidden"
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(0, progressPercent))}%`,
                  backgroundColor: 'var(--tertiary-fixed-dim)',
                  boxShadow: '0 0 8px rgba(255, 185, 84, 0.4)',
                }}
              />
            </div>
            <span className="font-headline font-semibold text-sm text-on-surface-variant tracking-tighter whitespace-nowrap">
              {current} / {total}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}