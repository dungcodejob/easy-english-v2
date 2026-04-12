import { WorkspaceSwitcher } from '@/modules/workspace/components/workspace-switcher';
import { useWorkspaceStore } from '@/modules/workspace/stores/workspace.store';
import { useUser } from '@/shared/stores/auth-store';
import {
  AchievementsRoutes,
  DictionaryRoutes,
  LearnRoutes,
  ProgressRoutes,
  SettingsRoutes,
  TopicRoutes,
} from '@/shared/constants';
import { Separator } from '@shared/ui/shadcn/separator';
import {
  BookOpen,
  Flame,
  Layers,
  School,
  Settings,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { NavGroup, type MenuItem } from '../ui/nav-group';
import { NavUser } from '../ui/nav-user';

export function AppSidebar({ ...props }: React.ComponentProps<'aside'>) {
  const { t } = useTranslation();
  const { currentWorkspaceId } = useWorkspaceStore();
  const authUser = useUser();

  const user = {
    name: authUser?.email?.split('@')[0] ?? 'User',
    email: authUser?.email ?? '',
    avatar: '',
  };

  // Main navigation items
  const navItems: MenuItem[] = [
    {
      id: useId(),
      title: t('sidebar.dashboard') ?? 'Dashboard',
      url: '/dashboard',
      icon: Flame,
    },
    {
      id: useId(),
      title: t('sidebar.dictionary') ?? 'Dictionary',
      url: DictionaryRoutes.search(),
      icon: BookOpen,
    },
    {
      id: useId(),
      title: t('sidebar.topics') ?? 'Topics',
      url: TopicRoutes.list(),
      icon: Layers,
    },
    {
      id: useId(),
      title: t('sidebar.study_hub') ?? 'Study Hub',
      url: LearnRoutes.base(),
      icon: School,
    },
    {
      id: useId(),
      title: t('sidebar.progress') ?? 'Progress',
      url: ProgressRoutes.list(),
      icon: TrendingUp,
    },
    {
      id: useId(),
      title: t('sidebar.achievements') ?? 'Achievements',
      url: AchievementsRoutes.list(),
      icon: Trophy,
    },
  ];

  // System actions
  const navSystem: MenuItem[] = [
    {
      id: useId(),
      title: t('sidebar.settings') ?? 'Settings',
      url: SettingsRoutes.list(),
      icon: Settings,
    },
  ];

  if (!currentWorkspaceId) {
    return null;
  }

  return (
    <aside
      className="h-screen w-64 fixed left-0 top-0 z-50 rounded-r-[3rem] bg-surface-container-low shadow-xl flex flex-col py-8"
      {...props}
    >
      {/* Brand Header */}
      <div className="px-8 mb-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white shadow-sm shrink-0">
          <School className="size-5" />
        </div>
        <div className="overflow-hidden">
          <h2 className="font-headline font-bold text-primary leading-none truncate">
            Scholar
          </h2>
          <p className="text-[10px] text-on-surface-variant font-medium truncate">
            Level 12 Philosopher
          </p>
        </div>
      </div>

      <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-1 px-3">
        <NavGroup items={navItems} />
        <div className="mt-auto">
          <NavGroup items={navSystem} />
        </div>
      </nav>

      <Separator className="border-t border-outline-variant/20" />

      <div className="mt-auto px-4 pb-2">
        <NavUser user={user} />
      </div>
    </aside>
  );
}
