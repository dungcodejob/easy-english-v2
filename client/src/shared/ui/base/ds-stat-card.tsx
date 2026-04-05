/**
 * DsStatCard — Design System Statistic Card
 *
 * Purpose-built for dashboard / overview stat cards.
 * Supports: gradient background, icon, label, value.
 * Theme-aware: color maps to dark mode variants automatically.
 *
 * Usage:
 *   import { DsStatCard } from '@/shared/ui/base'
 *   <DsStatCard
 *     label="Total Cards"
 *     value={42}
 *     icon={<Layers />}
 *     color="blue"
 *   />
 */

import type { ReactNode } from 'react';
import { cn } from '@/shared/utils';
import { DsCard } from './ds-card';

type StatColor = 'blue' | 'green' | 'purple' | 'amber' | 'red';

const colorMap: Record<
  StatColor,
  { gradient: string; border: string; text: string; icon: string }
> = {
  blue: {
    gradient: 'from-blue-500/10 to-blue-500/5',
    border: 'border-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    icon: 'text-blue-500',
  },
  green: {
    gradient: 'from-green-500/10 to-green-500/5',
    border: 'border-green-500/20',
    text: 'text-green-600 dark:text-green-400',
    icon: 'text-green-500',
  },
  purple: {
    gradient: 'from-purple-500/10 to-purple-500/5',
    border: 'border-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    icon: 'text-purple-500',
  },
  amber: {
    gradient: 'from-amber-500/10 to-amber-500/5',
    border: 'border-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    icon: 'text-amber-500',
  },
  red: {
    gradient: 'from-red-500/10 to-red-500/5',
    border: 'border-red-500/20',
    text: 'text-red-600 dark:text-red-400',
    icon: 'text-red-500',
  },
};

export interface DsStatCardProps {
  label: string;
  /** The numeric or string value to display prominently */
  value: number | string;
  /** Icon rendered next to the label */
  icon: ReactNode;
  /** Color variant — determines gradient, border, and text colors */
  color: StatColor;
  className?: string;
}

export function DsStatCard({
  label,
  value,
  icon,
  color,
  className,
}: DsStatCardProps) {
  const c = colorMap[color];

  return (
    <DsCard
      variant="stat"
      className={cn(
        'bg-gradient-to-br',
        c.gradient,
        c.border,
        className,
      )}
    >
      <div className="flex flex-row items-center justify-between pb-2">
        <span className={cn('text-sm font-medium', c.text)}>{label}</span>
        <span className={cn('size-4', c.icon)}>{icon}</span>
      </div>
      <DsCard.Content className="pt-0">
        <div className="text-2xl font-bold">{value}</div>
      </DsCard.Content>
    </DsCard>
  );
}
