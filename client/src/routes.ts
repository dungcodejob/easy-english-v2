import { index, layout, rootRoute, route } from '@tanstack/virtual-file-routes';
import { APP_ROUTES } from './shared/constants';

export const routes = rootRoute('root.tsx', [
  // Public index page
  index('modules/shell/pages/landing-page.tsx'),
  layout(
    '(unauthenticated)',
    './modules/shell/pages/unauthenticated-layout.tsx',
    [
      route(APP_ROUTES.AUTH.LOGIN, './modules/auth/pages/login-page.tsx'),
      route(APP_ROUTES.AUTH.REGISTER, './modules/auth/pages/register.page.tsx'),
    ],
  ),

  layout('(authenticated)', './modules/shell/pages/authenticated-layout.tsx', [
    route(APP_ROUTES.DASHBOARD, './modules/dashboard/pages/dashboard-page.tsx'),
    route(APP_ROUTES.LEARN, './modules/learning/pages/my-learning.page.tsx'),
    route(APP_ROUTES.LEARNING_STUDY, './modules/learning/pages/study-session.page.tsx'),
    route('/learning/topics', './modules/topic/pages/topics.page.tsx'),
    route(
      '/learning/topics/$topicId',
      './modules/topic/pages/topic-detail.page.tsx',
    ),
    route('/flashcards', './modules/flashcard/pages/flashcards.page.tsx'),
    route('/study', './modules/flashcard/pages/study.page.tsx'),
    route('/flashcards/stats', './modules/flashcard/pages/stats.page.tsx'),
    route(
      APP_ROUTES.WORKSPACE.NEW,
      './modules/workspace/pages/new-workspace.page.tsx',
    ),
    // Dictionary Routes (Now Inside App Shell)
    route(
      APP_ROUTES.DICTIONARY.SEARCH,
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
