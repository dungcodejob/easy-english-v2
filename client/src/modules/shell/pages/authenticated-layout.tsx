import { APP_ROUTES } from '@/shared/constants';
import { useAuthStore } from '@/shared/stores/auth-store';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

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
      // Returning false prevents the route from loading
      // return false;
    }

    // Allow route to load
    return true;
  },
});

export default function AuthenticatedLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
