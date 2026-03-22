/**
 * DsProgress — Design System Progress Bar
 *
 * Wraps the shadcn Progress with a stable API contract.
 *
 * Usage:
 *   import { DsProgress } from '@/shared/ui/base'
 *   <DsProgress value={75} size="md" />
 */

import { cn } from '@/shared/utils';
import { Progress as ShadcnProgress } from '@/shared/ui/shadcn/progress';
import type { ComponentProps } from './component-props';

export interface DsProgressProps extends ComponentProps {
  value?: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function DsProgress({ value, size = 'md', className, ...props }: DsProgressProps) {
  return (
    <ShadcnProgress
      value={value}
      className={cn(sizeClasses[size], className)}
      {...props}
    />
  );
}
