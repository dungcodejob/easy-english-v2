/**
 * DsCard — Design System Card
 *
 * Wraps the shadcn Card with a stable API contract.
 * Composes: Card + CardContent + CardHeader + CardTitle.
 *
 * Variants:
 *  - default  — standard card with padding
 *  - stat     — compact stat card (no gap-6, tighter spacing)
 *  - flat     — no shadow, no border
 *  - dashed   — dashed border (for empty / placeholder states)
 *
 * Sub-components accessed via DsCard.Header, DsCard.Content, etc.
 *
 * Usage:
 *   import { DsCard } from '@/shared/ui/base'
 *   <DsCard variant="dashed" className="...">
 *     <DsCard.Header>
 *       <DsCard.Title>...</DsCard.Title>
 *     </DsCard.Header>
 *     <DsCard.Content>...</DsCard.Content>
 *   </DsCard>
 */

import { type VariantProps, cva } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { cn } from '@/shared/utils';
import {
  Card as ShadcnCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/shadcn/card';

const cardVariants = cva('', {
  variants: {
    variant: {
      default: 'rounded-xl border bg-card text-card-foreground shadow-sm',
      stat: 'rounded-xl border bg-card text-card-foreground shadow-sm',
      flat: 'rounded-xl bg-card text-card-foreground',
      dashed: 'rounded-xl border border-dashed bg-card text-card-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

/* ─── Sub-components ──────────────────────────────────────────── */

function Header({
  children,
  className,
  actions,
}: {
  children?: ReactNode;
  className?: string;
  actions?: ReactNode;
}) {
  return (
    <CardHeader className={cn('flex flex-row items-center justify-between pb-2', className)}>
      <div>{children}</div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </CardHeader>
  );
}

function Title({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <CardTitle className={cn('text-sm font-medium', className)}>
      {children}
    </CardTitle>
  );
}

function Description({ children, className }: { children?: ReactNode; className?: string }) {
  return <CardDescription className={className}>{children}</CardDescription>;
}

function Content({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <CardContent className={cn('px-6', className)}>{children}</CardContent>;
}

/* ─── DsCard root ────────────────────────────────────────────── */

export interface DsCardProps {
  variant?: VariantProps<typeof cardVariants>['variant'];
  children?: ReactNode;
  className?: string;
}

export function DsCard({ variant = 'default', children, className }: DsCardProps) {
  return (
    <ShadcnCard className={cn(cardVariants({ variant }), className)}>
      {children}
    </ShadcnCard>
  );
}

/* ─── Attach sub-components ───────────────────────────────────── */

DsCard.Header = Header;
DsCard.Title = Title;
DsCard.Description = Description;
DsCard.Content = Content;
