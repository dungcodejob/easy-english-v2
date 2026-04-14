import * as React from 'react';

import { cn } from '@/shared/utils/index';

/**
 * SurfaceLabel — MD3-styled form label.
 *
 * Matches the "Scholarly Sanctuary" form style: small, semibold,
 * tracking-wide, on-primary-fixed-variant color.
 *
 * Follows the same pattern as shadcn primitives (data-slot, native <label>
 * prop signature, className override support).
 */
function SurfaceLabel({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="surface-label"
      className={cn(
        'block text-sm font-semibold tracking-wide text-on-primary-fixed-variant',
        className,
      )}
      {...props}
    />
  );
}

export { SurfaceLabel };
