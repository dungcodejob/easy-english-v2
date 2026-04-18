/**
 * CTAButton — the dominant primary action on a screen.
 *
 * Clarion aesthetic: gradient pill, headline font, pronounced shadow.
 * Use for "Continue", "Finalize", "Save" — the single most important
 * action in the current flow. Only one CTA per screen section.
 *
 *   <CTAButton type="submit">Continue to Step 3</CTAButton>
 */

import type { ReactNode } from 'react';
import { cn } from '@/shared/utils';
import { Button } from '@/shared/ui/shadcn/button';

interface CTAButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
  endIcon?: ReactNode;
  isLoading?: boolean;
}

export function CTAButton({
  children,
  onClick,
  disabled,
  type = 'button',
  className,
  endIcon,
  isLoading,
}: CTAButtonProps) {
  return (
    <Button
      variant="default"
      size="lg"
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        'group h-auto rounded-full px-10 py-4 gap-3',
        'bg-gradient-to-br from-primary to-primary-container text-primary-foreground',
        'font-headline font-semibold tracking-wide',
        'shadow-lg hover:shadow-xl hover:shadow-primary/20',
        'active:scale-[0.98] transition-all',
        className,
      )}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          {children}
        </span>
      ) : (
        <>
          <span>{children}</span>
          {endIcon && (
            <span className="inline-flex shrink-0 transition-transform group-hover:translate-x-1 [&>svg]:size-4">
              {endIcon}
            </span>
          )}
        </>
      )}
    </Button>
  );
}
