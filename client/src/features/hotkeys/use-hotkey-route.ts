import { useScopeStackStore } from './scope-stack';

/**
 * Generates TanStack Router beforeLoad / onLeave config
 * that automatically pushes a scope when entering a route
 * and pops it when leaving.
 *
 * @example
 * // In a route file:
 * export const Route = createFileRoute('/dashboard')({
 *   ...getRouteScopeConfig('dashboard'),
 *   component: DashboardPage,
 * });
 */
export function getRouteScopeConfig(scope: string) {
  return {
    beforeLoad: () => {
      useScopeStackStore.getState().pushScope(scope);
    },
    onLeave: () => {
      useScopeStackStore.getState().popScope();
    },
  };
}
