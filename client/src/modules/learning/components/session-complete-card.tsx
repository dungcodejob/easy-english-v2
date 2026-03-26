import { BookOpen, CheckCircle2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { APP_ROUTES } from '@/shared/constants';
import { DsButton } from '@/shared/ui';

interface SessionCompleteCardProps {
  reviewedCount: number;
  correctLikeCount: number;
  elapsedMs: number;
}

export function SessionCompleteCard({
  reviewedCount,
  correctLikeCount,
  elapsedMs,
}: SessionCompleteCardProps) {
  const navigate = useNavigate();

  const elapsedMin = Math.floor(elapsedMs / 60000);
  const elapsedSec = Math.floor((elapsedMs % 60000) / 1000);
  const accuracy =
    reviewedCount > 0
      ? Math.round((correctLikeCount / reviewedCount) * 100)
      : 0;

  return (
    <div className="flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-8 py-8 mx-auto">
      <div className="flex size-20 items-center justify-center rounded-full bg-green-500/10 ring-1 ring-green-500/20">
        <CheckCircle2 className="size-10 text-green-500" />
      </div>

      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
          Session complete!
        </h2>
        <p className="text-muted-foreground text-lg">
          Great work — keep it up.
        </p>
      </div>

      <div className="grid w-full grid-cols-3 gap-4">
        <div className="flex flex-col items-center rounded-xl border border-border bg-card px-4 py-3">
          <span className="text-2xl font-extrabold text-foreground tabular-nums">
            {reviewedCount}
          </span>
          <span className="text-xs text-muted-foreground">Reviewed</span>
        </div>
        <div className="flex flex-col items-center rounded-xl border border-border bg-card px-4 py-3">
          <span className="text-2xl font-extrabold text-foreground tabular-nums">
            {accuracy}%
          </span>
          <span className="text-xs text-muted-foreground">Accuracy</span>
        </div>
        <div className="flex flex-col items-center rounded-xl border border-border bg-card px-4 py-3">
          <span className="text-2xl font-extrabold text-foreground tabular-nums">
            {elapsedMin}:{elapsedSec.toString().padStart(2, '0')}
          </span>
          <span className="text-xs text-muted-foreground">Time</span>
        </div>
      </div>

      <DsButton
        leftIcon={<BookOpen className="size-4" />}
        onClick={() => navigate({ to: APP_ROUTES.LEARN })}
        className="w-full"
      >
        Back to My Learning
      </DsButton>
    </div>
  );
}
