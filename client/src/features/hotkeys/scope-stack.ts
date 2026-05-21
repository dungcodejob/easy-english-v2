import { create } from 'zustand';

const GLOBAL_SCOPE = 'global';

export type HotkeyScope = string;

interface ScopeStackState {
  /** Current scope stack, e.g. ["global", "dashboard", "create-dialog"] */
  stack: HotkeyScope[];
  /** Push a scope onto the stack. Idempotent: no-op if already on top. */
  pushScope: (scope: HotkeyScope) => void;
  /** Pop the top scope off the stack. No-op if it would pop "global". */
  popScope: () => void;
  /** Get a read-only copy of the active scopes. */
  getActiveScopes: () => HotkeyScope[];
  /**
   * Resolve the priority of a scope.
   * Higher number = higher priority (last in stack = highest).
   * Returns -1 if scope is not in the stack.
   */
  resolvePriority: (scope: HotkeyScope) => number;
}

export const useScopeStackStore = create<ScopeStackState>()((set, get) => ({
  stack: [GLOBAL_SCOPE],

  pushScope: (scope: HotkeyScope) => {
    set((state) => {
      const last = state.stack[state.stack.length - 1];
      if (last === scope) return state; // idempotent: no-op if already on top
      return { stack: [...state.stack, scope] };
    });
  },

  popScope: () => {
    set((state) => {
      if (state.stack.length <= 1) return state; // never pop global
      return { stack: state.stack.slice(0, -1) };
    });
  },

  getActiveScopes: () => [...get().stack],

  resolvePriority: (scope: HotkeyScope) => {
    return get().stack.indexOf(scope);
  },
}));

/** Global scope constant — always at the bottom of the stack. */
export { GLOBAL_SCOPE };
