import { refreshAccessToken } from '@/modules/auth/services/auth.api';
import { APP_ROUTES } from '@/shared/constants';
import { useAuthStore, useIsAuthenticated } from '@/shared/stores/auth-store';
import { Spinner } from '@/shared/ui/shadcn/spinner';
import {
  createFileRoute,
  Link,
  Navigate,
  Outlet,
  redirect,
  useLocation,
} from '@tanstack/react-router';
import { useEffect, useRef } from 'react';

// Use direct import to avoid circular dependency issues if any, or just use aliased import
import { useHasWorkspace } from '@/modules/workspace/hooks/use-has-workspace';

export const Route = createFileRoute('/_(authenticated)')({
  component: AuthenticatedLayout,
  beforeLoad: ({ location }) => {
    const { isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated) {
      // Redirect to login with redirect param
      throw redirect({
        to: APP_ROUTES.AUTH.LOGIN,
        search: { redirect: location.pathname },
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
    return (
      <Navigate
        to={APP_ROUTES.AUTH.LOGIN}
        replace
        search={{ redirect: location.pathname }}
      />
    );
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
  if (!hasWorkspace && location.pathname !== APP_ROUTES.WORKSPACE.NEW) {
    return <Navigate to={APP_ROUTES.WORKSPACE.NEW} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Temporary Navigation Header until AppSidebar is fully implemented */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-14 items-center gap-6 px-4">
          <Link
            to={APP_ROUTES.DASHBOARD}
            className="font-bold tracking-tight text-primary flex justify-center items-center gap-2"
          >
            Easy English
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link
              to={APP_ROUTES.DASHBOARD}
              className="transition-colors hover:text-foreground/80 text-foreground/60 [&.active]:text-foreground [&.active]:font-semibold"
            >
              Dashboard
            </Link>
            <Link
              to={APP_ROUTES.DICTIONARY.SEARCH}
              className="transition-colors hover:text-foreground/80 text-foreground/60 [&.active]:text-foreground [&.active]:font-semibold"
            >
              Dictionary
            </Link>
            <Link
              to={APP_ROUTES.LEARN}
              className="transition-colors hover:text-foreground/80 text-foreground/60 [&.active]:text-foreground [&.active]:font-semibold"
            >
              My Learning
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
