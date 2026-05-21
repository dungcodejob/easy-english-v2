import { SidebarTrigger } from '@/shared/ui/shadcn/sidebar';
import { LanguageSwitcher } from './language-switcher';
import { ModeSwitcher } from './mode-switcher';
import { SearchMenu } from './search-menu';
import { cn } from '@/shared/utils/tailwind';
import { UserMenu } from './user-menu';

export function AppHeader() {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex items-center justify-between gap-4 border-b px-8 py-4',
        'bg-surface/80 backdrop-blur-xl',
        'shadow-[0_12px_32px_rgba(26,27,30,0.06)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.3)]',
        'dark:border-white/5',
      )}
    >
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-2" />
        <span className="font-headline text-xl font-bold text-primary hidden sm:block">
          Scholarly Sanctuary
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <SearchMenu />
        <ModeSwitcher />
        <LanguageSwitcher />
        <UserMenu />
      </div>
    </header>
  );
}
