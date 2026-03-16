import { WorkspaceSwitcher } from '@/modules/workspace/components/workspace-switcher';
import { useWorkspaceStore } from '@/modules/workspace/stores/workspace.store';
import { APP_ROUTES } from '@/shared/constants';
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
  Plus,
  Settings,
  TrendingUp,
  Trophy,
  Layers,
} from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { NavGroup, type MenuItem } from '../ui/nav-group';
import { NavUser } from '../ui/nav-user';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation();
  const { currentWorkspaceId } = useWorkspaceStore();

  // Mock data for user - this should come from auth store
  const user = {
    name: 'User',
    email: 'user@example.com',
    avatar: '',
  };

  // Priority Section - Visually Emphasized
  const navPriority: MenuItem[] = [
    {
      id: useId(),
      title: t('sidebar.today_review'),
      url: APP_ROUTES.STUDY,
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
      url: APP_ROUTES.LEARN,
      icon: BookOpen,
    },
    {
      id: useId(),
      title: t('sidebar.topics'),
      url: APP_ROUTES.TOPIC.LIST,
      icon: BookOpen,
    },
    {
      id: useId(),
      title: t('sidebar.flashcards'),
      url: APP_ROUTES.FLASHCARDS,
      icon: Layers,
    },
    {
      id: useId(),
      title: t('sidebar.add_word'),
      url: APP_ROUTES.DICTIONARY.SEARCH, // for now redirect to dictionary to search and add
      icon: Plus,
    },
  ];

  // Progress Tracking - Secondary Information
  const navProgress: MenuItem[] = [
    {
      id: useId(),
      title: t('sidebar.progress'),
      url: APP_ROUTES.PROGRESS,
      icon: TrendingUp,
    },
    {
      id: useId(),
      title: t('sidebar.achievements'),
      url: APP_ROUTES.ACHIEVEMENTS,
      icon: Trophy,
    },
  ];

  // System Actions - Tertiary
  const navSystem: MenuItem[] = [
    {
      id: useId(),
      title: t('sidebar.settings'),
      url: APP_ROUTES.SETTINGS,
      icon: Settings,
    },
  ];

  if (!currentWorkspaceId) {
    return null; // Or render loading state/redirect
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <Separator orientation="horizontal" />
      <SidebarContent>
        <div className="bg-primary/5 rounded-lg mx-2 mt-2 pb-2">
          <NavGroup title={t('sidebar.priority')} items={navPriority} />
        </div>
        <NavGroup title={t('sidebar.learning')} items={navLearning} />
        <NavGroup title={t('sidebar.progress')} items={navProgress} />
        <div className="mt-auto">
          <NavGroup title={t('sidebar.system')} items={navSystem} />
        </div>
      </SidebarContent>
      <Separator orientation="horizontal" />
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
