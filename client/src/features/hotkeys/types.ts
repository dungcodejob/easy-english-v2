/**
 * Extend TanStack's HotkeyMeta via declaration merging.
 * This lets our custom fields (scope, group) coexist with the
 * library's built-in name/description fields.
 */
declare module '@tanstack/hotkeys' {
  interface HotkeyMeta {
    /** Scope this hotkey belongs to. Defaults to 'global'. */
    scope?: string;
    /** Feature group for display in the shortcuts modal. */
    group?: string;
  }
}

export type HotkeyScope = string;

export interface HotkeyOptions {
  /** Human-readable description shown in the shortcuts modal. */
  description?: string;
  /** Feature group for organizing shortcuts in the modal. */
  group?: string;
  /** Scope for this hotkey. Defaults to the current top of the scope stack. */
  scope?: HotkeyScope;
  /** Whether this hotkey is active. Defaults to true. */
  enabled?: boolean;
}

export interface UseHotkeyScopeOptions {
  /** What to do when the component mounts. */
  onMount?: 'push' | 'none';
}
