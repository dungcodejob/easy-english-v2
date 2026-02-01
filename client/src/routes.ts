import { index, rootRoute } from '@tanstack/virtual-file-routes';

export const routes = rootRoute('root.tsx', [
  // Public index page
  index('pages/index.tsx'),

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
