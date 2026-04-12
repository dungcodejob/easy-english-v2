import { WorkspaceSwitcher } from '@/modules/workspace/components/workspace-switcher';
import { useWorkspaceStore } from '@/modules/workspace/stores/workspace.store';
import { useUser } from '@/shared/stores/auth-store';
import {
  AchievementsRoutes,
  DictionaryRoutes,
  FlashcardsRoutes,
  LearnRoutes,
  ProgressRoutes,
  SettingsRoutes,
  TopicRoutes,
} from '@/shared/constants';
import { Separator } from '@shared/ui/shadcn/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@shared/ui/shadcn/sidebar';
import {
  BookOpen,
  Flame,
  Layers,
  Plus,
  Settings,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { NavGroup, type MenuItem } from '../ui/nav-group';
import { NavUser } from '../ui/nav-user';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation();
  const { currentWorkspaceId } = useWorkspaceStore();
  const authUser = useUser();

  const user = {
    name: authUser?.email?.split('@')[0] ?? 'User',
    email: authUser?.email ?? '',
    avatar: '',
  };

  // Priority Section - Visually Emphasized
  const navPriority: MenuItem[] = [
    {
      id: useId(),
      title: t('sidebar.today_review'),
      url: LearnRoutes.study(),
      icon: Flame, // 🔥 fire icon
      badge: 3, // pending review count (mock data)
      priority: true, // special styling flag
    },
  ];

  // Learning Actions - Primary Tasks
  const navLearning: MenuItem[] = [
    {
      id: useId(),
      title: t('sidebar.learn'),
      url: LearnRoutes.base(),
      icon: BookOpen,
    },
    {
      id: useId(),
      title: t('sidebar.topics'),
      url: TopicRoutes.list(),
      icon: BookOpen,
    },
    {
      id: useId(),
      title: t('sidebar.flashcards'),
      url: FlashcardsRoutes.list(),
      icon: Layers,
    },
    {
      id: useId(),
      title: t('sidebar.add_word'),
      url: DictionaryRoutes.search(), // for now redirect to dictionary to search and add
      icon: Plus,
    },
  ];

  // Progress Tracking - Secondary Information
  const navProgress: MenuItem[] = [
    {
      id: useId(),
      title: t('sidebar.progress'),
      url: ProgressRoutes.list(),
      icon: TrendingUp,
    },
    {
      id: useId(),
      title: t('sidebar.achievements'),
      url: AchievementsRoutes.list(),
      icon: Trophy,
    },
  ];

  // System Actions - Tertiary
  const navSystem: MenuItem[] = [
    {
      id: useId(),
      title: t('sidebar.settings'),
      url: SettingsRoutes.list(),
      icon: Settings,
    },
  ];

  if (!currentWorkspaceId) {
    return null; // Or render loading state/redirect
  }

  return (
    <Sidebar collapsible="icon" className="rounded-r-3xl shadow-xl" {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <nav aria-label="Main navigation" className="flex flex-col gap-1 px-3 pt-2">
          <NavGroup items={navPriority} />
          <NavGroup items={navLearning} />
          <NavGroup items={navProgress} />
          <div className="mt-auto">
            <NavGroup items={navSystem} />
          </div>
        </nav>
      </SidebarContent>
      <Separator className="border-t border-outline-variant/20" />
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
