/**
 * BackButton — quiet navigation back or cancel.
 *
 * Visually quiet on purpose. Never competes with the CTA.
 * Always pairs with an arrow that slides left on hover.
 *
 *   <BackButton onClick={onBack}>Return to Selection</BackButton>
 */

import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/shared/utils';
import { Button } from '@/shared/ui/shadcn/button';

interface BackButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function BackButton({
  children,
  onClick,
  disabled,
  className,
}: BackButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group rounded-full gap-2 px-3 font-medium',
        'text-on-primary-fixed-variant hover:text-primary hover:bg-surface-container/60',
        className,
      )}
    >
      <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
      <span>{children}</span>
    </Button>
  );
}
