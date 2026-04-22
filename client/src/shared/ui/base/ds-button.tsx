/**
 * DsButton — Design System Button
 *
 * Wraps the shadcn Button with a stable API contract.
 * All button variants, sizes, and states are pre-defined here.
 * Feature modules MUST import from here, never from '@/shared/ui/shadcn'.
 *
 * Variants:
 *  - primary   → main call-to-action (submits forms, starts flows)
 *  - secondary → secondary actions (alternative paths)
 *  - outline   → bordered neutral (toggles, toolbars)
 *  - ghost     → minimal (navigation, inline actions)
 *  - destructive → danger zone (delete, reset)
 *  - link      → inline text link
 *
 * Sizes:
 *  - xs  → compact (table rows, chips)
 *  - sm  → small (toolbar, secondary CTAs)
 *  - md  → default (forms, cards)
 *  - lg  → large (hero sections, primary CTAs)
 *  - icon / icon-sm / icon-xs / icon-lg → square icon-only buttons
 *
 * Usage:
 *   import { DsButton } from '@/shared/ui/base'
 *   <DsButton variant="primary" size="md" leftIcon={<Plus />}>Add Item</DsButton>
 */

import { type VariantProps, cva } from 'class-variance-authority';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/utils';
import { Button, buttonVariants } from '@/shared/ui/shadcn/button';
import { DsSpinner } from './ds-spinner';

/* ─── Extended CVA variants ──────────────────────────────────── */

const dsButtonVariants = cva('', {
  variants: {
    variant: {
      /** Solid primary CTA — use for main page/submit actions */
      primary:
        'bg-primary text-primary-foreground hover:bg-primary/85 active:bg-primary/95 focus-visible:ring-4 focus-visible:ring-primary/25',
      default: buttonVariants({ variant: 'default' }),
      outline: buttonVariants({ variant: 'outline' }),
      secondary: buttonVariants({ variant: 'secondary' }),
      ghost: buttonVariants({ variant: 'ghost' }),
      destructive: buttonVariants({ variant: 'destructive' }),
      link: buttonVariants({ variant: 'link' }),
    },
    size: {
      default: buttonVariants({ size: 'default' }),
      xs: buttonVariants({ size: 'xs' }),
      sm: buttonVariants({ size: 'sm' }),
      lg: buttonVariants({ size: 'lg' }),
      icon: buttonVariants({ size: 'icon' }),
      'icon-xs': buttonVariants({ size: 'icon-xs' }),
      'icon-sm': buttonVariants({ size: 'icon-sm' }),
      'icon-lg': buttonVariants({ size: 'icon-lg' }),
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'default',
  },
});

type DsButtonVariant = VariantProps<typeof dsButtonVariants>['variant'];
type DsButtonSize = VariantProps<typeof dsButtonVariants>['size'];

export interface DsButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: DsButtonVariant;
  size?: DsButtonSize;
  asChild?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
  loadingLabel?: string;
  fullWidth?: boolean;
}

export function DsButton({
  variant = 'primary',
  size = 'default',
  className,
  asChild,
  leftIcon,
  rightIcon,
  isLoading,
  loadingLabel = 'Loading',
  fullWidth,
  children,
  disabled,
  type,
  ...props
}: DsButtonProps) {
  const isIconOnly = !children && (leftIcon || rightIcon);

  return (
    <Button
      asChild={asChild}
      disabled={disabled || isLoading}
      type={type}
      className={cn(
        dsButtonVariants({ variant, size }),
        fullWidth && 'w-full',
        className,
      )}
      data-icon-only={isIconOnly ? true : undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {/* Loading spinner — replaces icon slot during loading */}
          {isLoading ? (
            <>
              <DsSpinner
                size={
                  size === 'icon-xs' || size === 'xs'
                    ? 'sm'
                    : size === 'lg' || size === 'icon-lg'
                      ? 'md'
                      : 'sm'
                }
                className={cn(!isIconOnly && 'mr-2')}
              />
              {children && <span>{children}</span>}
              {isIconOnly && <span className="sr-only">{loadingLabel}</span>}
            </>
          ) : (
            <>
              {leftIcon && (
                <span
                  data-icon="inline-start"
                  className={cn(
                    'inline-flex shrink-0 [&>svg]:pointer-events-none [&>svg]:shrink-0',
                    !isIconOnly && 'mr-2',
                    // Size-specific icon spacing inside icon-only buttons
                    (size === 'xs' || size === 'icon-xs') && '[&>svg]:size-3',
                    (size === 'sm' || size === 'icon-sm') && '[&>svg]:size-3.5',
                    size === 'lg' && '[&>svg]:size-5',
                    size === 'icon-lg' && '[&>svg]:size-5',
                    (size === 'default' || size === 'icon') && '[&>svg]:size-4',
                  )}
                >
                  {leftIcon}
                </span>
              )}
              {children && <span>{children}</span>}
              {rightIcon && (
                <span
                  data-icon="inline-end"
                  className={cn(
                    'inline-flex shrink-0 [&>svg]:pointer-events-none [&>svg]:shrink-0',
                    !isIconOnly && 'ml-2',
                    (size === 'xs' || size === 'icon-xs') && '[&>svg]:size-3',
                    (size === 'sm' || size === 'icon-sm') && '[&>svg]:size-3.5',
                    size === 'lg' && '[&>svg]:size-5',
                    size === 'icon-lg' && '[&>svg]:size-5',
                    (size === 'default' || size === 'icon') && '[&>svg]:size-4',
                  )}
                >
                  {rightIcon}
                </span>
              )}
            </>
          )}
        </>
      )}
    </Button>
  );
}
