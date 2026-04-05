/**
 * DsTextarea — Design System Textarea
 *
 * Wraps the shadcn Textarea with a stable API contract.
 *
 * Usage:
 *   import { DsTextarea } from '@/shared/ui/base'
 *   <DsTextarea placeholder="Describe your workspace..." rows={4} />
 */

import { cn } from '@/shared/utils';
import { Textarea as ShadcnTextarea } from '@/shared/ui/shadcn/textarea';
import type { TextareaHTMLAttributes } from 'react';
import { forwardRef } from 'react';

export interface DsTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Loading state — shows a spinner overlay and disables the textarea */
  isLoading?: boolean;
  /** Extra className on the wrapper (not the textarea itself) */
  wrapperClassName?: string;
}

export const DsTextarea = forwardRef<HTMLTextAreaElement, DsTextareaProps>(
  ({ isLoading, wrapperClassName, className, disabled, ...props }, ref) => {
    return (
      <div className={cn('relative', wrapperClassName)}>
        <ShadcnTextarea
          ref={ref}
          disabled={disabled || isLoading}
          className={cn(
            isLoading && 'opacity-60 cursor-not-allowed',
            className,
          )}
          {...props}
        />
        {isLoading && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="size-4 animate-spin text-muted-foreground"
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
          </div>
        )}
      </div>
    );
  },
);

DsTextarea.displayName = 'DsTextarea';
