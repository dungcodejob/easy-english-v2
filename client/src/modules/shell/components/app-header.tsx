import { SidebarTrigger } from '@/shared/ui/shadcn/sidebar';
import { LanguageSwitcher } from './language-switcher';
import { ModeSwitcher } from './mode-switcher';
import { SearchMenu } from './search-menu';
import { cn } from '@/shared/utils/tailwind';

export function AppHeader() {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex items-center justify-between gap-6 border-b px-6 py-3',
        'bg-surface/80 backdrop-blur-xl',
        'shadow-[0_12px_32px_rgba(26,27,30,0.06)]'
      )}
    >
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-2" />
        <span className="font-headline text-xl font-bold text-primary hidden sm:block">
          Easy English
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <SearchMenu />
        <ModeSwitcher />
        <LanguageSwitcher />
      </div>
    </header>
  );
}
