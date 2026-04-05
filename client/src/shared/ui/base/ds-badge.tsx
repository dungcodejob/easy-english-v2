/**
 * DsBadge — Design System Badge
 *
 * Wraps the shadcn Badge with a stable API contract.
 * Adds: dot indicator variant, icon slot, size prop.
 *
 * Variants:
 *  - default, secondary, destructive, outline, ghost, link  (shadcn base)
 *  - success  — green (completed, active, online)
 *  - warning  — amber (in progress, pending)
 *  - info     — blue (informational)
 *
 * Usage:
 *   import { DsBadge } from '@/shared/ui/base'
 *   <DsBadge variant="success" dot>Active</DsBadge>
 */

import { type VariantProps, cva } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { cn } from '@/shared/utils';
import { Badge as ShadcnBadge, badgeVariants } from '@/shared/ui/shadcn/badge';

const dsBadgeVariants = cva('', {
  variants: {
    variant: {
      default: badgeVariants({ variant: 'default' }),
      secondary: badgeVariants({ variant: 'secondary' }),
      destructive: badgeVariants({ variant: 'destructive' }),
      outline: badgeVariants({ variant: 'outline' }),
      ghost: badgeVariants({ variant: 'ghost' }),
      link: badgeVariants({ variant: 'link' }),
      /** Green — completed, active, online */
      success:
        'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      /** Amber — in progress, pending, warning */
      warning:
        'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      /** Blue — informational, neutral status */
      info: 'border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type DsVariant = VariantProps<typeof dsBadgeVariants>['variant'];

const dotColorMap: Record<string, string> = {
  default: 'bg-primary',
  secondary: 'bg-secondary',
  destructive: 'bg-destructive',
  outline: 'bg-foreground/30',
  ghost: 'bg-foreground/30',
  link: 'bg-primary',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
};

export interface DsBadgeProps {
  variant?: DsVariant;
  /** Render a colored dot before the label */
  dot?: boolean;
  children?: ReactNode;
  className?: string;
  asChild?: boolean;
}

export function DsBadge({
  variant = 'default',
  dot,
  children,
  className,
  asChild,
}: DsBadgeProps) {
  return (
    <ShadcnBadge
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      variant={variant as any}
      asChild={asChild}
      className={cn(dsBadgeVariants({ variant }), className)}
    >
      <span className="inline-flex items-center gap-1.5">
        {dot && (
          <span
            className={cn('size-1.5 shrink-0 rounded-full', dotColorMap[variant ?? 'default'])}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    </ShadcnBadge>
  );
}
