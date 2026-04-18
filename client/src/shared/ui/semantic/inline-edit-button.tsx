/**
 * InlineEditButton — tiny inline affordance inside cards or text blocks.
 *
 * Uppercase micro-link. Reveals its interactivity only via underline on hover.
 * Use for "EDIT" links inside review/summary bento cards.
 *
 *   <InlineEditButton onClick={handleEdit}>Edit</InlineEditButton>
 */

import type { ReactNode } from 'react';
import { cn } from '@/shared/utils';
import { Button } from '@/shared/ui/shadcn/button';

interface InlineEditButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function InlineEditButton({
  children,
  onClick,
  disabled,
  className,
}: InlineEditButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'h-auto px-0 py-0 text-xs font-bold uppercase tracking-widest',
        'text-on-primary-fixed-variant hover:bg-transparent hover:text-primary hover:underline',
        className,
      )}
    >
      {children}
    </Button>
  );
}
