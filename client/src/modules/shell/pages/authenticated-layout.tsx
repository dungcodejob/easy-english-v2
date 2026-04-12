import { refreshAccessToken } from '@/modules/auth/services/auth.api';
import { useAuthStore, useIsAuthenticated } from '@/shared/stores/auth-store';
import { Spinner } from '@/shared/ui/shadcn/spinner';
import {
  createFileRoute,
  Navigate,
  Outlet,
  redirect,
  useLocation,
} from '@tanstack/react-router';
import { useEffect, useRef } from 'react';

// Use direct import to avoid circular dependency issues if any, or just use aliased import
import { useHasWorkspace } from '@/modules/workspace/hooks/use-has-workspace';
import { AuthRoutes, WorkspaceRoutes } from '@/shared/constants';
import { SidebarInset, SidebarProvider } from '@/shared/ui/shadcn/sidebar';
import { AppHeader } from '../components/app-header';
import { AppSidebar } from '../components/app-sidebar';

export const Route = createFileRoute('/_(authenticated)')({
  component: AuthenticatedLayout,
  beforeLoad: ({ location }) => {
    const { isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated) {
      // Redirect to login with redirect param
      throw redirect({
        to: AuthRoutes.login(location.pathname),
        replace: true,
      });
    }
  },
});

export default function AuthenticatedLayout() {
  const isAuthenticated = useIsAuthenticated();
  const { data: hasWorkspaceData, isLoading } = useHasWorkspace();
  const location = useLocation();
  const hasRefreshed = useRef(false);

  useEffect(() => {
    if (!hasRefreshed.current) {
      hasRefreshed.current = true;
      const state = useAuthStore.getState();
      if (state.isAuthenticated && state.accessToken) {
        // We could check token expiry here, but calling refresh right away
        // ensures we get the latest session from backend safely.
        refreshAccessToken().catch(() => {
          // Silent catch, token-refresh handles the logout internally
        });
      }
    }
  }, []);

  if (!isAuthenticated) {
    return <Navigate to={AuthRoutes.login(location.pathname)} replace />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  const hasWorkspace = hasWorkspaceData?.hasWorkspace;

  // If user has no workspace and is not on the onboarding page, redirect to onboarding
  if (!hasWorkspace && location.pathname !== WorkspaceRoutes.new()) {
    return <Navigate to={WorkspaceRoutes.new()} />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className="flex flex-1 flex-col h-full bg-surface">
          <div className="flex-1">
            <div className="ml-64 pt-20 p-12 max-w-[1400px] mx-auto flex flex-1 flex-col self-stretch">
              <Outlet />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
