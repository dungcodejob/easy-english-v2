import { Navigate, Outlet } from '@tanstack/react-router';
import { APP_ROUTES } from '../../../shared/constants';
import { useAuthStore } from '../../../shared/stores/auth-store';

export const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <Navigate to={APP_ROUTES.AUTH.LOGIN} />;
  }

  return <Outlet />;
};
