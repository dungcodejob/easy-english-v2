/**
 * PageLayout — consistent shell for authenticated app pages
 *
 * Responsibilities:
 * - Render an optional sticky header
 * - Render a scrollable main content area
 * - Apply correct padding and max-width
 * - Handle empty states
 *
 * Usage:
 *   <PageLayout
 *     header={<AppHeader />}
 *     title="Dashboard"
 *     description="Overview of your learning progress"
 *     actions={<Button>Add Item</Button>}
 *   >
 *     <DashboardContent />
 *   </PageLayout>
 */

import type { ReactNode } from 'react';

import { cn } from '@/shared/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Optional action buttons rendered on the right side of the header */
  actions?: ReactNode;
  /** Breadcrumbs or navigation rendered above the title */
  breadcrumbs?: ReactNode;
  className?: string;
}

interface PageLayoutProps {
  children: ReactNode;
  /** Sticky top bar — pass <AppHeader /> here */
  header?: ReactNode;
  /** Optional fixed side navigation */
  sidebar?: ReactNode;
  /** Page metadata (title, description, actions) */
  pageHeader?: PageHeaderProps;
  /** Max-width constraint for content area */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Whether to render header actions inline or in a toolbar */
  toolbar?: ReactNode;
  className?: string;
}

const maxWidthMap = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
} as const;

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {breadcrumbs && <div className="mb-3">{breadcrumbs}</div>}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function PageLayout({
  children,
  header,
  pageHeader,
  toolbar,
  maxWidth = '2xl',
  className = '',
}: PageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Sticky app header */}
      {header && <div className="sticky top-0 z-40">{header}</div>}

      {/* Optional toolbar (e.g., filters, search bar below the header) */}
      {toolbar && (
        <div className="border-b border-border bg-background/80 px-6 py-3 backdrop-blur-sm">
          <div className="mx-auto flex items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">{toolbar}</div>
          </div>
        </div>
      )}

      {/* Main scrollable content */}
      <main
        className={cn(
          'mx-auto w-full flex-1 px-4 py-6 sm:px-6 lg:px-8',
          maxWidthMap[maxWidth],
          className,
        )}
      >
        {/* Page header */}
        {pageHeader && (
          <div className="mb-6">
            <PageHeader {...pageHeader} />
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
