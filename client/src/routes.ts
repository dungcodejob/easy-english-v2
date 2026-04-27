import { index, layout, rootRoute, route } from '@tanstack/virtual-file-routes';
import {
  AuthRoutes,
  DashboardRoutes,
  DictionaryRoutes,
  FlashcardsRoutes,
  LearnRoutes,
  ProgressRoutes,
  SettingsRoutes,
  TopicRoutes,
  WorkspaceRoutes,
} from './shared/constants';

export const routes = rootRoute('root.tsx', [
  // Public index page
  index('modules/shell/pages/landing-page.tsx'),
  layout(
    '(unauthenticated)',
    './modules/shell/pages/unauthenticated-layout.tsx',
    [
      route(
        AuthRoutes.login(),
        './modules/auth/screens/login/login.screen.tsx',
      ),
      route(
        AuthRoutes.register(),
        './modules/auth/screens/register/register.screen.tsx',
      ),
    ],
  ),

  layout('(authenticated)', './modules/shell/pages/authenticated-layout.tsx', [
    route(
      DashboardRoutes.list(),
      './modules/dashboard/pages/dashboard-page.tsx',
    ),
    route(
      LearnRoutes.base(),
      './modules/learning/screens/my-learning/my-learning.screen.tsx',
    ),
    route(
      LearnRoutes.study(),
      './modules/learning/screens/study-session/study-session.screen.tsx',
    ),
    route(
      TopicRoutes.list(),
      './modules/topic/screens/topics/topics.screen.tsx',
    ),
    route(
      TopicRoutes.detail('$topicId'),
      './modules/topic/screens/topic-detail/topic-detail.screen.tsx',
    ),
    route(
      FlashcardsRoutes.list(),
      './modules/flashcard/pages/flashcards.page.tsx',
    ),
    route(FlashcardsRoutes.study(), './modules/flashcard/pages/study.page.tsx'),
    route(FlashcardsRoutes.stats(), './modules/flashcard/pages/stats.page.tsx'),
    route(
      WorkspaceRoutes.list(),
      './modules/workspace/pages/workspaces.page.tsx',
    ),
    route(
      WorkspaceRoutes.settings(),
      './modules/workspace/pages/workspace-settings.page.tsx',
    ),
    route(ProgressRoutes.list(), './modules/progress/pages/progress.page.tsx'),
    route(SettingsRoutes.list(), './modules/settings/pages/settings.page.tsx'),
    // Dictionary Routes (Now Inside App Shell)
    route(
      DictionaryRoutes.search(),

      './modules/learning/screens/dictionary-layout.tsx',
      [
        index('./modules/dictionary/screens/word-search.screen.tsx'),
        route(
          '/senses/$senseId',
          './modules/dictionary/screens/word-sense-detail.screen.tsx',
        ),
      ],
    ),
  ]),

  layout(
    '(authenticated-fullscreen)',
    './modules/shell/pages/authenticated-fullscreen-layout.tsx',
    [
      route(
        WorkspaceRoutes.new(),
        './modules/workspace/pages/new-workspace.page.tsx',
      ),
    ],
  ),
  // ========== LAYOUT AUTHENTICATED ==========
  // layout('(authenticated)', './modules/shell/pages/authenticated-layout.tsx', [
  //   index('./modules/home/pages/home-page.tsx'),
  // ]),

  // ========== LAYOUT UNAUTHENTICATED ==========
  // layout('(unauthenticated)', './modules/shell/pages/unauthenticated-layout.tsx', [
  //   route('/login', './modules/auth/pages/login-page.tsx'),
  //   route('/register', './modules/auth/pages/register-page.tsx'),
  // ]),
]);
