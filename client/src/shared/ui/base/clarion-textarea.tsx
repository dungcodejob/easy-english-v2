import * as React from 'react';

import { cn } from '@/shared/utils/index';

/**
 * ClarionTextarea — filled textarea for the Clarion design system.
 *
 * surface-container-low background, rounded-xl, no visible border,
 * focus ring on primary-container.
 *
 * Built as a thin wrapper so it stays compatible with shadcn patterns
 * (forwardRef-free in React 19, data-slot, same prop signature as <textarea>).
 */
function ClarionTextarea({
  className,
  ...props
}: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="clarion-textarea"
      className={cn(
        'w-full resize-none rounded-xl border-none bg-surface-container-low px-5 py-4 text-on-surface transition-all',
        'placeholder:text-on-surface-variant/50',
        'focus:ring-2 focus:ring-primary-container focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:ring-destructive/20',
        className,
      )}
      {...props}
    />
  );
}

export { ClarionTextarea };
