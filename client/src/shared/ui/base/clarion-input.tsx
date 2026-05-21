import * as React from 'react';

import { cn } from '@/shared/utils/index';

/**
 * ClarionInput — underline input for the Clarion design system.
 *
 * Transparent background, bottom-border only, Lexend headline font,
 * focus color on secondary.
 *
 * Built as a thin wrapper so it stays compatible with shadcn patterns
 * (forwardRef-free in React 19, data-slot, same prop signature as <input>).
 */
function ClarionInput({
  className,
  type = 'text',
  ...props
}: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="clarion-input"
      className={cn(
        'w-full border-0 border-b-2 border-outline-variant/30 bg-transparent py-3 font-headline text-lg text-on-surface transition-colors',
        'placeholder:text-on-surface-variant/40',
        'focus:border-secondary focus:ring-0 focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  );
}

export { ClarionInput };
