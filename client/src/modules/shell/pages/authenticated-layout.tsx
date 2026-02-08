import { APP_ROUTES } from '@/shared/constants';
import { useAuthStore } from '@/shared/stores/auth-store';
import { Spinner } from '@/shared/ui/shadcn/spinner';
import {
  createFileRoute,
  Navigate,
  Outlet,
  redirect,
  useLocation,
} from '@tanstack/react-router';

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
  const { data: hasWorkspaceData, isLoading } = useHasWorkspace();
  const location = useLocation();

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
    <div>
      <Outlet />
    </div>
  );
}
