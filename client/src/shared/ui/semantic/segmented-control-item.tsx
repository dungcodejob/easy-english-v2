/**
 * SegmentedControlItem — one pill segment inside a segmented control.
 *
 * Stretches to fill available width (`flex-1`). Active state is driven
 * by `isActive`; no hover color to keep the group visually calm.
 * Wrap items in a flex container with the Clarion pill track, e.g.:
 *
 *   <div className="flex items-center bg-surface-container-highest p-1 rounded-full">
 *     <SegmentedControlItem isActive>Beginner</SegmentedControlItem>
 *     <SegmentedControlItem>Intermediate</SegmentedControlItem>
 *   </div>
 */

import type { ReactNode } from 'react';
import { cn } from '@/shared/utils';
import { Button } from '@/shared/ui/shadcn/button';

interface SegmentedControlItemProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  isActive?: boolean;
  className?: string;
}

export function SegmentedControlItem({
  children,
  onClick,
  disabled,
  isActive,
  className,
}: SegmentedControlItemProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={isActive}
      className={cn(
        'flex-1 h-auto rounded-full border-none bg-transparent shadow-none',
        'py-3 px-2 text-xs font-bold font-headline',
        'text-on-surface-variant hover:bg-transparent hover:text-primary',
        isActive &&
          'bg-surface-container-lowest text-primary shadow-sm hover:bg-surface-container-lowest',
        className,
      )}
    >
      {children}
    </Button>
  );
}
