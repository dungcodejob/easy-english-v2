/**
 * ClarionProgress — Progress bar for the Clarion design system.
 *
 * Wraps the shadcn Progress with a stable API contract.
 *
 * Usage:
 *   import { ClarionProgress } from '@/shared/ui/base'
 *   <ClarionProgress value={75} size="md" variant="primary" />
 */

import { cn } from '@/shared/utils';
import { Progress as ShadcnProgress } from '@/shared/ui/shadcn/progress';
import type { ComponentProps } from './component-props';

export type ClarionProgressVariant =
  | 'primary'
  | 'error'
  | 'success'
  | 'warning'
  | 'info';

export interface ClarionProgressProps extends ComponentProps {
  value?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: ClarionProgressVariant;
  trackClassName?: string;
  indicatorClassName?: string;
}

const sizeClasses: Record<NonNullable<ClarionProgressProps['size']>, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const trackByVariant: Record<ClarionProgressVariant, string> = {
  primary: 'bg-primary/15',
  error: 'bg-surface-container',
  success: 'bg-surface-container',
  warning: 'bg-surface-container',
  info: 'bg-surface-container',
};

const indicatorByVariant: Record<ClarionProgressVariant, string> = {
  primary: '[&>*]:!bg-primary',
  error: '[&>*]:!bg-error',
  success: '[&>*]:!bg-success',
  warning: '[&>*]:!bg-warning',
  info: '[&>*]:!bg-info',
};

export function ClarionProgress({
  value,
  size = 'md',
  variant = 'primary',
  className,
  trackClassName,
  indicatorClassName,
  ...props
}: ClarionProgressProps) {
  return (
    <ShadcnProgress
      value={value}
      className={cn(
        sizeClasses[size],
        trackByVariant[variant],
        indicatorByVariant[variant],
        '[&>*]:transition-[width,transform] [&>*]:duration-700 [&>*]:ease-out',
        trackClassName,
        indicatorClassName,
        className,
      )}
      {...props}
    />
  );
}
