import { index, layout, rootRoute, route } from '@tanstack/virtual-file-routes';
import {
  AuthRoutes,
  DashboardRoutes,
  DictionaryRoutes,
  FlashcardsRoutes,
  LearnRoutes,
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
      route(AuthRoutes.login(), './modules/auth/pages/login-page.tsx'),
      route(AuthRoutes.register(), './modules/auth/pages/register.page.tsx'),
    ],
  ),

  layout('(authenticated)', './modules/shell/pages/authenticated-layout.tsx', [
    route(
      DashboardRoutes.list(),
      './modules/dashboard/pages/dashboard-page.tsx',
    ),
    route(LearnRoutes.base(), './modules/learning/pages/my-learning.page.tsx'),
    route(
      LearnRoutes.study(),
      './modules/learning/pages/study-session.page.tsx',
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
    // Dictionary Routes (Now Inside App Shell)
    route(
      DictionaryRoutes.search(),

      './modules/learning/pages/dictionary-layout.tsx',
      [
        index('./modules/learning/pages/dictionary-search.page.tsx'),
        route(
          '/senses/$senseId',
          './modules/learning/pages/word-sense-detail.page.tsx',
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
