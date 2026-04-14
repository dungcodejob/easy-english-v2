/**
 * DsPagination — Reusable pill-style pagination component.
 *
 * Built on shadcn/pagination primitives with Material Design 3 token styling.
 * Handles page number windowing with ellipsis automatically.
 *
 * Usage:
 *   <DsPagination page={page} totalPages={totalPages} onPageChange={setPage} />
 *
 * Variants:
 *   - "pill"    (default) — enclosed in a rounded pill container with shadow
 *   - "minimal" — no container, just the nav buttons
 */

import { cn } from '@/shared/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────

interface DsPaginationProps {
  /** Current active page (1-based). */
  page: number;
  /** Total number of pages. */
  totalPages: number;
  /** Called when user clicks a page. */
  onPageChange: (page: number) => void;
  /** Maximum number of page buttons to show (default: 5). */
  maxVisible?: number;
  /** Visual variant (default: "pill"). */
  variant?: 'pill' | 'minimal';
  /** Additional class name for the outer container. */
  className?: string;
}

// ── Helpers ─────────────────────────────────────────────────────

/**
 * Compute which page numbers to display, with ellipsis gaps.
 * Returns an array of numbers and 'ellipsis' markers.
 *
 * Examples (maxVisible=5):
 *   page=1,  total=8  → [1, 2, 3, 4, 5, 'ellipsis', 8]
 *   page=4,  total=8  → [1, 'ellipsis', 3, 4, 5, 'ellipsis', 8]
 *   page=7,  total=8  → [1, 'ellipsis', 4, 5, 6, 7, 8]
 *   page=2,  total=4  → [1, 2, 3, 4]
 */
function getPageNumbers(
  page: number,
  totalPages: number,
  maxVisible: number,
): (number | 'ellipsis')[] {
  if (totalPages <= maxVisible + 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(2, page - half);
  let end = Math.min(totalPages - 1, page + half);

  // Adjust window if near edges
  if (page <= half + 1) {
    end = maxVisible;
  } else if (page >= totalPages - half) {
    start = totalPages - maxVisible + 1;
  }

  const pages: (number | 'ellipsis')[] = [1];

  if (start > 2) pages.push('ellipsis');

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages - 1) pages.push('ellipsis');

  pages.push(totalPages);

  return pages;
}

// ── Component ───────────────────────────────────────────────────

export function DsPagination({
  page,
  totalPages,
  onPageChange,
  maxVisible = 5,
  variant = 'pill',
  className,
}: DsPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages, maxVisible);

  const nav = (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn(
        'flex items-center gap-2',
        variant === 'pill' &&
          'rounded-full bg-surface-container-low px-6 py-2.5 shadow-sm',
        className,
      )}
    >
      {/* Previous */}
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        aria-label="Go to previous page"
        className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary disabled:opacity-30"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Page numbers */}
      {pages.map((item, idx) =>
        item === 'ellipsis' ? (
          <span
            key={`ellipsis-${idx}`}
            className="flex h-10 w-10 items-center justify-center text-sm text-outline"
            aria-hidden
          >
            ...
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            aria-current={page === item ? 'page' : undefined}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full font-headline text-sm transition-colors',
              page === item
                ? 'bg-primary font-bold text-white'
                : 'font-medium text-on-surface-variant hover:bg-surface-container-high',
            )}
          >
            {item}
          </button>
        ),
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        aria-label="Go to next page"
        className="flex h-10 w-20 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary disabled:opacity-30"
      >
        Next
        <ChevronRight className="h-5 w-5" />
      </button>
    </nav>
  );

  return <div className="flex justify-center">{nav}</div>;
}
