import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/ui/shadcn/sidebar';
import { Link, useRouterState } from '@tanstack/react-router';
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
  title: string;
  items: MenuItem[];
}) {
  const routerState = useRouterState();
  const location = routerState.location;

  if (!items?.length) return null;
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mt-4 mb-2">
        {title}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  className="transition-colors duration-200"
                >
                  {item.url ? (
                    <Link to={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  ) : (
                    <div>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </div>
                  )}
                </SidebarMenuButton>
                {item.badge !== undefined && (
                  <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
