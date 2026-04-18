/**
 * ClarionButton — Clarion design system button
 *
 * Variants tailored to the editorial Clarion aesthetic:
 *  - primary     → gradient pill CTA (from-primary to-primary-container, rounded-full)
 *  - ghost-back  → minimal back link; pairs with a left arrow that translates on hover (via `group`)
 *  - edit        → tiny uppercase underline link (inline "EDIT" affordance in bento cards)
 *  - segmented   → pill segment for segmented controls
 *
 * Usage:
 *   <ClarionButton variant="primary" rightIcon={<ArrowRight />}>Continue</ClarionButton>
 *   <ClarionButton variant="ghost-back" leftIcon={<ArrowLeft />}>Back</ClarionButton>
 */

import { type VariantProps, cva } from 'class-variance-authority';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/utils';

const clarionButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-none',
  {
    variants: {
      variant: {
        primary:
          'group bg-gradient-to-br from-primary to-primary-container text-primary-foreground rounded-full px-10 py-4 font-headline font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/20 active:scale-[0.98] tracking-wide',
        'ghost-back':
          'group text-on-primary-fixed-variant hover:text-primary font-medium bg-transparent px-3 py-2 rounded-full hover:bg-surface-container/60',
        edit: 'text-on-primary-fixed-variant text-xs font-bold uppercase tracking-widest hover:underline px-0 py-0',
        segmented:
          'flex-1 py-3 px-2 rounded-full text-xs font-bold font-headline text-on-surface-variant hover:text-primary data-[active=true]:bg-surface-container-lowest data-[active=true]:shadow-sm data-[active=true]:text-primary',
      },
      active: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
);

type ClarionButtonVariant = VariantProps<
  typeof clarionButtonVariants
>['variant'];

export interface ClarionButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type'
> {
  variant?: ClarionButtonVariant;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
  loadingLabel?: string;
  isActive?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function ClarionButton({
  variant = 'primary',
  className,
  leftIcon,
  rightIcon,
  isLoading,
  loadingLabel = 'Loading...',
  isActive,
  children,
  disabled,
  type = 'button',
  ...props
}: ClarionButtonProps) {
  const animateLeft =
    variant === 'ghost-back'
      ? 'transition-transform group-hover:-translate-x-1'
      : '';
  const animateRight =
    variant === 'primary'
      ? 'transition-transform group-hover:translate-x-1'
      : '';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      data-active={isActive ? 'true' : undefined}
      className={cn(clarionButtonVariants({ variant }), className)}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin size-4"
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
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          {leftIcon && (
            <span
              className={cn(
                'inline-flex shrink-0 [&>svg]:size-4 [&>svg]:pointer-events-none',
                animateLeft,
              )}
            >
              {leftIcon}
            </span>
          )}
          {children && <span>{children}</span>}
          {rightIcon && (
            <span
              className={cn(
                'inline-flex shrink-0 [&>svg]:size-4 [&>svg]:pointer-events-none',
                animateRight,
              )}
            >
              {rightIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
}
