import * as React from 'react';

import { cn } from '@/shared/utils/index';

/**
 * ClarionLabel — form label for the Clarion design system.
 *
 * Small, semibold, tracking-wide, on-primary-fixed-variant color.
 *
 * Follows the same pattern as shadcn primitives (data-slot, native <label>
 * prop signature, className override support).
 */
function ClarionLabel({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="clarion-label"
      className={cn(
        'block text-sm font-semibold tracking-wide text-on-primary-fixed-variant',
        className,
      )}
      {...props}
    />
  );
}

export { ClarionLabel };
