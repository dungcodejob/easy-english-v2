import { Button } from '@/shared/ui/shadcn/button';
import { SidebarTrigger } from '@/shared/ui/shadcn/sidebar';
import { Search } from 'lucide-react';
import { ActivitySheet } from './activity-sheet';

import { LanguageSwitcher } from './language-switcher';
import { ModeSwitcher } from './mode-switcher';
import { NotificationDropdown } from './notification-dropdown';

export function AppHeader() {
  return (
    <header className="bg-card sticky top-0 z-50 flex items-center justify-between gap-6 border-b px-4 py-2 sm:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-2" />

        <div
          data-orientation="vertical"
          role="none"
          className="bg-border shrink-0 w-px hidden h-4! sm:block md:max-lg:hidden"
        />

        {/* Search Desktop */}
        <Button
          variant="outline"
          className="text-muted-foreground hidden h-9 w-72 items-center justify-between gap-2 px-3 font-normal sm:flex md:max-lg:hidden hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span>Search words, topics...</span>
          </div>
          <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground hidden sm:flex">
            ⌘K
          </kbd>
        </Button>

        {/* Search Mobile */}
        <Button
          size="icon"
          variant="ghost"
          className="sm:hidden md:max-lg:inline-flex"
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </div>

      <div className="flex items-center gap-1.5">
        <ModeSwitcher />

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Activity Log */}
        <ActivitySheet />

        {/* Notifications */}
        <NotificationDropdown />

        {/* User Profile */}
        {/* <Button variant="ghost" className="pl-0 gap-2 h-9">
          <div className="relative flex shrink-0 overflow-hidden size-9 rounded-md">
            <img
              className="aspect-square size-full"
              src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png"
              alt="User Avatar"
            />
          </div>
          <div className="hidden flex-col items-start gap-0.5 sm:flex">
            <span className="text-sm font-medium">John Doe</span>
            <span className="text-muted-foreground text-xs">Admin</span>
          </div>
        </Button> */}
      </div>
    </header>
  );
}
