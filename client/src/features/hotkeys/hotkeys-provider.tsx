import { useEffect, useState } from 'react';
import {
  getHotkeyManager,
  matchesKeyboardEvent,
  type HotkeyCallbackContext,
  type HotkeyRegistration,
} from '@tanstack/hotkeys';
import { useHotkey } from '@tanstack/react-hotkeys';
import { useScopeStackStore } from './scope-stack';
import { ShortcutsModal } from './shortcut-modal';

/**
 * Root provider for the hotkeys system.
 *
 * Responsibilities:
 * 1. Initialize the global scope ("global") is done in the store itself.
 * 2. Register the global Ctrl+/ shortcut to open the shortcuts modal via useHotkey.
 * 3. Maintain a SINGLE capture-phase keydown listener that intercepts ALL
 *    matching registrations and fires only the highest-priority one
 *    (based on the scope stack). TanStack's default bubble-phase listeners
 *    are bypassed via stopImmediatePropagation().
 */
export function HotkeysProvider({ children }: { children: React.ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);

  // Register the global "show shortcuts" hotkey via useHotkey (SSR-safe)
  useHotkey('Mod+/', () => {
    setModalOpen((prev) => !prev);
  }, {
    meta: {
      scope: 'global',
      group: 'System',
      description: 'Open keyboard shortcuts',
    },
  });

  // Capture-phase interceptor — runs BEFORE TanStack's bubble listener
  useEffect(() => {
    const manager = getHotkeyManager();

    const captureHandler = (event: KeyboardEvent) => {
      const registrations = manager.registrations.state;

      // 1. Find all registrations whose hotkey matches this keyboard event
      const matching: HotkeyRegistration[] = [];
      for (const reg of registrations.values()) {
        if (!reg.options.enabled) continue;
        if (matchesKeyboardEvent(event, reg.parsedHotkey, reg.options.platform)) {
          matching.push(reg);
        }
      }

      if (matching.length === 0) return;

      // 2. Filter to scopes in the active stack
      const active = useScopeStackStore.getState().stack;
      const inScope = matching.filter((reg) => {
        const regScope = reg.options.meta?.scope ?? 'global';
        return active.includes(regScope);
      });

      if (inScope.length === 0) return;

      // 3. Sort by scope priority (last in stack = highest)
      inScope.sort((a, b) => {
        const sa = active.indexOf(a.options.meta?.scope ?? 'global');
        const sb = active.indexOf(b.options.meta?.scope ?? 'global');
        return sb - sa; // highest priority first
      });

      // 4. Fire only the topmost handler
      const top = inScope[0];
      const context: HotkeyCallbackContext = {
        hotkey: top.hotkey,
        parsedHotkey: top.parsedHotkey,
      };

      top.callback(event, context);

      // 5. Block TanStack's default bubble handler from also firing
      event.stopImmediatePropagation();
    };

    document.addEventListener('keydown', captureHandler, { capture: true });
    return () => {
      document.removeEventListener('keydown', captureHandler, { capture: true });
    };
  }, []);

  return (
    <>
      {children}
      <ShortcutsModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
