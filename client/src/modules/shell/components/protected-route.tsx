import { Navigate, Outlet } from '@tanstack/react-router';
import { APP_ROUTES } from '../../../shared/constants';
import { useAuthStore } from '../../../shared/stores/auth-store';

export const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
     
    return <Navigate to={APP_ROUTES.AUTH.LOGIN} />;
  }

  return <Outlet />;
};
