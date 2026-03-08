import { SidebarTrigger } from '@/shared/ui/shadcn/sidebar';
import { ActivitySheet } from './activity-sheet';

import { LanguageSwitcher } from './language-switcher';
import { ModeSwitcher } from './mode-switcher';
import { NotificationDropdown } from './notification-dropdown';
import { SearchMenu } from './search-menu';

export function AppHeader() {
  return (
    <header className="bg-card sticky top-0 z-50 flex items-center justify-between gap-6 border-b px-4 py-2 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <SidebarTrigger className="-ml-2" />
        <SearchMenu />
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
