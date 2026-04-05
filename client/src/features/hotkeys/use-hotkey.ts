import {
  useHotkey as useHotkeyTanStack,
  type RegisterableHotkey,
  type UseHotkeyOptions,
} from '@tanstack/react-hotkeys';
import { useScopeStackStore } from './scope-stack';
import type { HotkeyOptions } from './types';

const DEFAULT_ENABLED = true;

/**
 * Registers a keyboard shortcut with scope-aware priority resolution.
 *
 * - Uses @tanstack/react-hotkeys' `useHotkey` under the hood (handles SSR, ref
 *   stability, and React lifecycle automatically).
 * - Scope priority is resolved by the capture-phase interceptor in HotkeysProvider.
 * - Metadata (description, group, scope) is stored in HotkeyMeta via declaration merging.
 *
 * @example
 * useHotkey('Mod+K', () => openCommandPalette(), {
 *   description: 'Open command palette',
 *   group: 'Navigation',
 * });
 */
export function useHotkey(
  hotkey: RegisterableHotkey,
  callback: (event: KeyboardEvent) => void,
  options: HotkeyOptions = {},
): void {
  const { description, group, scope, enabled = DEFAULT_ENABLED } = options;
  const topScope = useScopeStackStore(
    (s) => s.stack[s.stack.length - 1] ?? 'global',
  );
  const resolvedScope = scope ?? topScope;

  const hotkeyOptions: UseHotkeyOptions = {
    enabled,
    meta: {
      description,
      group,
      scope: resolvedScope,
    },
    preventDefault: true,
    stopPropagation: false, // Capture handler owns propagation control
  };

  // Cast to RegisterableHotkey — library accepts template literal types like 'Mod+K'
  useHotkeyTanStack(hotkey, (event) => callback(event), hotkeyOptions);
}

/**
 * Parses a hotkey string into displayable key parts.
 * Used by the shortcuts modal to render key badges.
 */
export function parseHotkeyDisplay(hotkey: string): string[] {
  return hotkey
    .replace(/mod/gi, 'Mod')
    .split('+')
    .map((k) => k.trim());
}
