/**
 * DsSpinner — Design System Loading Spinner
 *
 * Wraps the shadcn Spinner with size variants.
 *
 * Usage:
 *   import { DsSpinner } from '@/shared/ui/base'
 *   <DsSpinner size="sm" />
 *   <DsSpinner size="lg" label="Loading your data..." />
 */

import { cn } from '@/shared/utils';
import { Loader2Icon } from 'lucide-react';

export interface DsSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Accessible label for screen readers (hidden, defaults to "Loading") */
  label?: string;
}

const sizeMap = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
};

export function DsSpinner({
  size = 'md',
  label = 'Loading',
  className,
}: DsSpinnerProps) {
  return (
    <Loader2Icon
      role="status"
      aria-label={label}
      className={cn('animate-spin', sizeMap[size], className)}
    />
  );
}
