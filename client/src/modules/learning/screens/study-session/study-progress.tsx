import { ClarionProgress } from '@/shared/ui';

interface StudyProgressProps {
  current: number;
  total: number;
  label?: string;
}

export function StudyProgress({ current, total, label }: StudyProgressProps) {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground tabular-nums">
          {current} / {total}
        </span>
      </div>
      <ClarionProgress value={progress} className="h-2" />
    </div>
  );
}
