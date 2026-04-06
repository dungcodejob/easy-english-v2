import { useNavigate } from '@tanstack/react-router';
import { BookOpen, CheckCircle2 } from 'lucide-react';

import { LearnRoutes } from '@/shared/constants';
import { DsButton } from '@/shared/ui';
import type { RatingBreakdown, SessionSummary } from '../types/study.types';

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

  const stats = sessionSummary
    ? {
        reviewed: sessionSummary.reviewedCount,
        accuracy: sessionSummary.accuracy,
        elapsedMs: sessionSummary.timeSpentMs,
        ratingBreakdown: sessionSummary.ratingBreakdown,
      }
    : {
        reviewed: reviewedCount ?? 0,
        accuracy:
          (reviewedCount ?? 0) > 0
            ? Math.round(((correctLikeCount ?? 0) / (reviewedCount ?? 0)) * 100)
            : 0,
        elapsedMs: elapsedMs ?? 0,
        ratingBreakdown: null,
      };

  const elapsedMin = Math.floor(stats.elapsedMs / 60000);
  const elapsedSec = Math.floor((stats.elapsedMs % 60000) / 1000);

  return (
    <div className="flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-8 py-8 mx-auto">
      {/* Icon */}
      <div className="flex size-20 items-center justify-center rounded-full bg-green-500/10 ring-1 ring-green-500/20">
        <CheckCircle2 className="size-10 text-green-500" />
      </div>

      {/* Heading */}
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
          Session complete!
        </h2>
        <p className="text-muted-foreground text-lg">Great work — keep it up.</p>
      </div>

      {/* Stats */}
      <div className="grid w-full grid-cols-3 gap-4">
        <StatCell value={stats.reviewed} label="Reviewed" />
        <StatCell value={`${stats.accuracy}%`} label="Accuracy" />
        <StatCell
          value={`${elapsedMin}:${elapsedSec.toString().padStart(2, '0')}`}
          label="Time"
        />
      </div>

      {/* Rating breakdown */}
      {stats.ratingBreakdown && <RatingRow breakdown={stats.ratingBreakdown} />}

      {/* CTA */}
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

/* ─── Shared sub-components ─────────────────────────────────────── */

function StatCell({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-border bg-card px-4 py-3">
      <span className="text-2xl font-extrabold text-foreground tabular-nums">
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

const RATING_LABELS: Array<{
  key: keyof RatingBreakdown;
  label: string;
  color: string;
}> = [
  { key: 'again', label: 'Again', color: 'text-red-500' },
  { key: 'hard', label: 'Hard', color: 'text-orange-500' },
  { key: 'good', label: 'Good', color: 'text-green-500' },
  { key: 'easy', label: 'Easy', color: 'text-blue-500' },
];

function RatingRow({ breakdown }: { breakdown: RatingBreakdown }) {
  const hasAny = RATING_LABELS.some(({ key }) => breakdown[key] > 0);
  if (!hasAny) return null;

  return (
    <div className="flex w-full gap-3">
      {RATING_LABELS.map(({ key, label, color }) => (
        <div
          key={key}
          className="flex flex-1 flex-col items-center rounded-xl border border-border bg-card px-2 py-2"
        >
          <span className={`text-lg font-bold tabular-nums ${color}`}>
            {breakdown[key]}
          </span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}
