/**
 * ModalWrapper — consistent dialog shell wrapping Radix Dialog
 *
 * Responsibilities:
 * - Standardized modal sizing (sm, md, lg, xl, full)
 * - Title + description + optional footer slot
 * - Proper focus trapping and scroll lock (inherited from Radix)
 * - Keyboard close on Escape
 *
 * Usage:
 *   <ModalWrapper
 *     open={isOpen}
 *     onOpenChange={setIsOpen}
 *     title="Delete Item"
 *     description="This action cannot be undone."
 *     footer={<Button variant="destructive" onClick={handleDelete}>Delete</Button>}
 *   >
 *     <p>Modal body content</p>
 *   </ModalWrapper>
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog';
import type { ReactNode } from 'react';

interface ModalWrapperProps {
  /** Controls open state */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dialog title — required for a11y */
  title: string;
  /** Optional description below title */
  description?: string;
  /** Content between header and footer */
  children: ReactNode;
  /** Optional footer actions (typically buttons) */
  footer?: ReactNode;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
} as const;

export function ModalWrapper({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
  className = '',
}: ModalWrapperProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${sizeClasses[size]} ${className}`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        <div className="py-2">{children}</div>
        {footer && (
          <DialogFooter className="gap-2 sm:gap-0">{footer}</DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
