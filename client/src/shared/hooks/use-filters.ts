import {
  type RegisteredRouter,
  type RouteIds,
  getRouteApi,
  useNavigate,
} from '@tanstack/react-router';
import { cleanEmptyParams } from '../utils';

export function useFilters<T extends RouteIds<RegisteredRouter['routeTree']>>(
  routeId: T,
) {
  const routeApi = getRouteApi<T>(routeId);
  const navigate = useNavigate();
  const filters = routeApi.useSearch();

  const setFilters = (partialFilters: Partial<typeof filters>) =>
    navigate({
      // @ts-ignore
      search: (prev) => cleanEmptyParams({ ...prev, ...partialFilters }),
    });
  // @ts-ignore
  const resetFilters = () => navigate({ search: {} });

  return { filters, setFilters, resetFilters };
}
