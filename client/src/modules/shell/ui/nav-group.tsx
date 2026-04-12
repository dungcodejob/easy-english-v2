import { Badge } from '@/shared/ui/shadcn/badge';
import { cn } from '@/shared/utils';
import { Link, useRouterState } from '@tanstack/react-router';
import type { ElementType } from 'react';
import { motion } from 'motion/react';

export interface MenuItem {
  id: string;
  title: string;
  url?: string;
  icon?: ElementType;
  badge?: number;
  priority?: boolean;
}

export function NavGroup({
  title,
  items,
}: {
  title?: string;
  items: MenuItem[];
}) {
  const routerState = useRouterState();
  const location = routerState.location;

  if (!items?.length) return null;

  return (
    <div className="flex flex-col">
      {title && (
        <div className="px-5 py-1 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
          {title}
        </div>
      )}
      {items.map((item) => {
        const isActive = item.url ? location.pathname === item.url : false;
        return (
          <Link
            key={item.id}
            to={item.url ?? '#'}
            className={cn(
              'relative flex items-center gap-4 rounded-full mx-4 py-3 px-6 text-sm font-medium transition-all duration-300',
              isActive
                ? 'bg-gradient-to-br from-primary to-primary-container text-white shadow-lg shadow-primary/10 scale-105'
                : 'text-on-surface-variant hover:bg-surface-container-high',
            )}
          >
            {item.icon && <item.icon className="h-5 w-5 shrink-0" />}
            <span className="font-headline">{item.title}</span>
            {item.badge != null && (
              <Badge className="ml-auto bg-surface-container-high text-on-surface-variant rounded-full px-2 py-0.5 text-xs">
                {item.badge}
              </Badge>
            )}
          </Link>
        );
      })}
    </div>
  );
}
