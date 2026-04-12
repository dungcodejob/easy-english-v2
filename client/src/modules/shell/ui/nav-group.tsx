import { Badge } from '@/shared/ui/shadcn/badge';
import { cn } from '@/shared/utils';
import { NavLink } from '@tanstack/react-router';
import type { ElementType } from 'react';

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
  if (!items?.length) return null;

  return (
    <div className="flex flex-col">
      {title && (
        <div className="px-5 py-1 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
          {title}
        </div>
      )}
      {items.map((item) => {
        return (
          <NavLink
            key={item.id}
            to={item.url ?? '#'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isActive
                  ? 'bg-gradient-to-br from-primary to-primary-container text-white shadow-lg'
                  : 'text-on-surface-variant hover:bg-surface-container-high',
              )
            }
          >
            {item.icon && <item.icon className="h-5 w-5 shrink-0" />}
            <span className="font-headline">{item.title}</span>
            {item.badge != null && (
              <Badge className="ml-auto bg-surface-container-high text-on-surface-variant rounded-full px-2 py-0.5 text-xs">
                {item.badge}
              </Badge>
            )}
          </NavLink>
        );
      })}
    </div>
  );
}
