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

import { useHasWorkspace } from '@/modules/workspace/hooks/use-has-workspace';
import { AuthRoutes, WorkspaceRoutes } from '@/shared/constants';
import { SidebarProvider } from '@/shared/ui/shadcn/sidebar';
import { AppHeader } from '../components/app-header';
import { AppSidebar } from '../components/app-sidebar';

export const Route = createFileRoute('/_(authenticated)')({
  component: AuthenticatedLayout,
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

  if (!hasWorkspace && location.pathname !== WorkspaceRoutes.new()) {
    return <Navigate to={WorkspaceRoutes.new()} />;
  }

  return (
    <SidebarProvider>
      {/* Fixed sidebar — matches mockup: w-64, rounded-r-[3rem], full height */}
      <AppSidebar />
      {/* Main content area — offset by sidebar width, below header */}
      <div className="ml-64 pl-0">
        <AppHeader />
        <main className="pt-20 p-12 max-w-[1400px] mx-auto">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}