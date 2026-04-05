import { useNavigate } from '@tanstack/react-router';
import { BookOpen, CheckCircle2 } from 'lucide-react';

import { LearnRoutes } from '@/shared/constants';
import { DsButton } from '@/shared/ui';
import type { SessionSummary } from '../types/study.types';

interface SessionCompleteCardProps {
  /** Primary — server-computed summary (rendered when available) */
  sessionSummary?: SessionSummary;
  /** Fallback — client-side counters when server summary unavailable */
  reviewedCount?: number;
  correctLikeCount?: number;
  elapsedMs?: number;
}

export function SessionCompleteCard({
  sessionSummary,
  reviewedCount,
  correctLikeCount,
  elapsedMs,
}: SessionCompleteCardProps) {
  const navigate = useNavigate();

  // Primary: server-provided data
  if (sessionSummary) {
    const elapsedMin = Math.floor(sessionSummary.timeSpentMs / 60000);
    const elapsedSec = Math.floor((sessionSummary.timeSpentMs % 60000) / 1000);
    const { ratingBreakdown, accuracy } = sessionSummary;

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
              {sessionSummary.reviewedCount}
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

        {/* Rating breakdown */}
        {(ratingBreakdown.again > 0 ||
          ratingBreakdown.hard > 0 ||
          ratingBreakdown.good > 0 ||
          ratingBreakdown.easy > 0) && (
          <div className="flex w-full gap-3">
            {[
              {
                label: 'Again',
                count: ratingBreakdown.again,
                color: 'text-red-500',
              },
              {
                label: 'Hard',
                count: ratingBreakdown.hard,
                color: 'text-orange-500',
              },
              {
                label: 'Good',
                count: ratingBreakdown.good,
                color: 'text-green-500',
              },
              {
                label: 'Easy',
                count: ratingBreakdown.easy,
                color: 'text-blue-500',
              },
            ].map(({ label, count, color }) => (
              <div
                key={label}
                className="flex flex-1 flex-col items-center rounded-xl border border-border bg-card px-2 py-2"
              >
                <span className={`text-lg font-bold tabular-nums ${color}`}>
                  {count}
                </span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        )}

        <DsButton
          leftIcon={<BookOpen className="size-4" />}
          onClick={() => navigate({ to: LearnRoutes.base() })}
          className="w-full"
        >
          Back to My Learning
        </DsButton>
      </div>
    );
  }

  // Fallback — client-side counters (no server session)
  const rCount = reviewedCount ?? 0;
  const cCount = correctLikeCount ?? 0;
  const elapsed = elapsedMs ?? 0;
  const elapsedMin = Math.floor(elapsed / 60000);
  const elapsedSec = Math.floor((elapsed % 60000) / 1000);
  const accuracy = rCount > 0 ? Math.round((cCount / rCount) * 100) : 0;

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
            {rCount}
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
        onClick={() => navigate({ to: LearnRoutes.base() })}
        className="w-full"
      >
        Back to My Learning
      </DsButton>
    </div>
  );
}
