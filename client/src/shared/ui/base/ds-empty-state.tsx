/**
 * DsEmptyState — Design System Empty State
 *
 * Renders a centered empty state with icon, title, description, and CTA.
 * Used when a list/collection has no items.
 *
 * Usage:
 *   import { DsEmptyState } from '@/shared/ui/base'
 *   <DsEmptyState
 *     icon={<Layers />}
 *     title="No flashcards yet"
 *     description="Create your first flashcard to get started"
 *     action={<Button onClick={() => setIsOpen(true)}>Create Card</Button>}
 *   />
 */

import type { ReactNode } from 'react';

export interface DsEmptyStateProps {
  /** Icon rendered in a circle above the title */
  icon: ReactNode;
  /** Primary heading */
  title: string;
  /** Secondary description text */
  description?: string;
  /** CTA button rendered below the description */
  action?: ReactNode;
  className?: string;
}

export function DsEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: DsEmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 ${className ?? ''}`}
    >
      {/* Icon circle */}
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <span className="size-6 text-muted-foreground">{icon}</span>
      </div>
      {/* Text */}
      <h3 className="mb-1 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      )}
      {/* Action */}
      {action}
    </div>
  );
}
