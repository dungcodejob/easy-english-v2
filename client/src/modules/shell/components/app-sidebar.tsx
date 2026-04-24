import { useWorkspaceStore } from '@/modules/workspace/stores/workspace.store';
import { WorkspaceSwitcher } from '@/modules/workspace/components/workspace-switcher';
import {
  AchievementsRoutes,
  DictionaryRoutes,
  LearnRoutes,
  ProgressRoutes,
  SettingsRoutes,
  TopicRoutes,
} from '@/shared/constants';
import { useUser } from '@/shared/stores/auth-store';
import { Separator } from '@shared/ui/shadcn/separator';
import {
  BookMarked,
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
      title: t('sidebar.flashcards') ?? 'Flashcards',
      url: '',
      icon: BookMarked,
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
      className="h-screen w-64 fixed left-0 top-0 z-50 rounded-r-[3rem] bg-surface-container-low shadow-xl flex flex-col py-8 dark:bg-surface-container dark:shadow-2xl dark:border-r dark:border-white/5"
      {...props}
    >
      {/* Current Workspace + Switcher */}
      <div className="px-5 mb-10">
        <WorkspaceSwitcher />
      </div>

      {/* Navigation */}
      <nav aria-label="Main navigation" className="flex-1 space-y-1">
        <NavGroup items={navItems} />
      </nav>

      <Separator className="mx-4 border-t border-outline-variant/10 dark:border-white/5" />

      {/* System Navigation */}
      <div className="mt-auto pt-2 space-y-1">
        <NavGroup items={navSystem} />
      </div>

      <div className="px-4 pb-2">
        <NavUser user={user} />
      </div>
    </aside>
  );
}
