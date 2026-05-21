import { useEffect } from 'react';
import { useScopeStackStore } from './scope-stack';
import type { UseHotkeyScopeOptions } from './types';

/**
 * Manual scope push/pop for dialogs, panels, or any component
 * outside of TanStack Router's lifecycle.
 *
 * @example
 * // Auto push on mount, pop on unmount
 * const { pushScope, popScope } = useHotkeyScope('create-dialog', { onMount: 'push' });
 *
 * @example
 * // Manual control
 * const { pushScope, popScope } = useHotkeyScope('my-panel');
 * useEffect(() => {
 *   pushScope();
 *   return () => popScope();
 * }, []);
 */
export function useHotkeyScope(
  scope: string,
  options: UseHotkeyScopeOptions = {},
): { pushScope: (scope?: string) => void; popScope: () => void } {
  const storePush = useScopeStackStore((s) => s.pushScope);
  const storePop = useScopeStackStore((s) => s.popScope);

  useEffect(() => {
    if (options.onMount === 'push') {
      storePush(scope);
      return () => storePop();
    }
  }, [scope, options.onMount, storePush, storePop]);

  return {
    pushScope: (s?: string) => storePush(s ?? scope),
    popScope: storePop,
  };
}
