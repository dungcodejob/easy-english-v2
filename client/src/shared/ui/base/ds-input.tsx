/**
 * DsInput — Design System Input
 *
 * Wraps the shadcn Input with a stable API contract.
 * Provides: left/right adornment slots, leading icon, loading state.
 * Feature modules MUST import from here, never from '@/shared/ui/shadcn'.
 *
 * Usage:
 *   import { DsInput } from '@/shared/ui/base'
 *   <DsInput placeholder="Search..." leftIcon={<Search />} />
 */

import { cn } from '@/shared/utils';
import { Input } from '@/shared/ui/shadcn/input';
import type { InputHTMLAttributes } from 'react';
import type { ReactNode } from 'react';
import { forwardRef } from 'react';

export interface DsInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Leading icon (search, user, etc.) */
  leadingIcon?: ReactNode;
  /** Trailing icon (clear button, show/hide password, etc.) */
  trailingIcon?: ReactNode;
  /** Loading state — shows a spinner replacing trailing icon */
  isLoading?: boolean;
  /** Input wrapper className (for layout around the input, not the input itself) */
  wrapperClassName?: string;
  /** onClick handler for the trailing icon button */
  onTrailingClick?: () => void;
  /** Accessible label for the trailing icon button */
  trailingLabel?: string;
}

export const DsInput = forwardRef<HTMLInputElement, DsInputProps>(
  (
    {
      leadingIcon,
      trailingIcon,
      isLoading,
      wrapperClassName,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn('relative', wrapperClassName)}>
        {/* Leading icon */}
        {leadingIcon && (
          <div
            className={cn(
              'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground',
              disabled && 'opacity-50',
            )}
            aria-hidden="true"
          >
            <span className="[&>svg]:size-4">{leadingIcon}</span>
          </div>
        )}

        {/* Input */}
        <Input
          ref={ref}
          disabled={disabled}
          className={cn(
            leadingIcon && 'pl-10',
            (trailingIcon || isLoading) && 'pr-10',
            className,
          )}
          {...props}
        />

        {/* Trailing slot (icon or spinner) */}
        {(trailingIcon || isLoading) && (
          <div
            className={cn(
              'absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground',
              disabled && 'opacity-50',
            )}
          >
            {isLoading ? (
              <svg
                className="size-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <button
                type="button"
                className="hover:text-foreground cursor-pointer transition-colors focus:outline-none"
                onClick={props.onTrailingClick}
                aria-label={props.trailingLabel}
              >
                <span className="[&>svg]:size-4">{trailingIcon}</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  },
);

DsInput.displayName = 'DsInput';
