import { useAuthStore, useIsAuthenticated } from '@/shared/stores/auth-store';
import { AuthRoutes } from '@/shared/constants';
import {
  createFileRoute,
  Navigate,
  Outlet,
  redirect,
  useLocation,
} from '@tanstack/react-router';

export const Route = createFileRoute('/_(authenticated-fullscreen)')({
  component: AuthenticatedFullscreenLayout,
  beforeLoad: ({ location }) => {
    const { isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated) {
      throw redirect({
        to: AuthRoutes.login(location.pathname),
        replace: true,
      });
    }
  },
});

export default function AuthenticatedFullscreenLayout() {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={AuthRoutes.login(location.pathname)} replace />;
  }

  return <Outlet />;
}
