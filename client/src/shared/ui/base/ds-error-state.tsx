import { cn } from '@/shared/utils';
import type { ReactNode } from 'react';

export interface DsErrorStateProps {
  title?: string;
  message?: string;
  action?: ReactNode;
  className?: string;
}

export function DsErrorState({
  title = 'Something went wrong',
  message,
  action,
  className,
}: DsErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-error/20 bg-error-container/10 p-12 text-center',
        className,
      )}
    >
      {title && (
        <h3 className="mb-2 font-headline text-xl font-bold text-error">
          {title}
        </h3>
      )}
      {message && (
        <p className="mb-6 max-w-sm text-sm text-on-surface-variant">
          {message}
        </p>
      )}
      {action}
    </div>
  );
}
