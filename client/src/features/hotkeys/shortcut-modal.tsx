import { useState } from 'react';
import {
  useHotkeyRegistrations,
} from '@tanstack/react-hotkeys';
import { SearchIcon } from 'lucide-react';

import { Input } from '@/shared/ui/shadcn/input';
import { Separator } from '@/shared/ui/shadcn/separator';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/shadcn/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog';
import { CommandKeyBox } from '@/shared/ui/common/command-key-box';

import { useScopeStackStore } from './scope-stack';
import { parseHotkeyDisplay } from './use-hotkey';

/** Renders each key in a hotkey string as a badge */
function KeyBadges({ hotkey }: { hotkey: string }) {
  const parts = parseHotkeyDisplay(hotkey);
  return (
    <div className="flex items-center gap-0.5">
      {parts.map((part, i) => (
        <CommandKeyBox key={i} className="min-w-[1.4rem] px-1 text-xs font-medium">
          {part}
        </CommandKeyBox>
      ))}
    </div>
  );
}

interface ShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShortcutsModal({ open, onOpenChange }: ShortcutsModalProps) {
  const [search, setSearch] = useState('');
  const scopes = useScopeStackStore((s) => s.stack);
  const [activeTab, setActiveTab] = useState(
    scopes[scopes.length - 1] ?? 'global',
  );

  // Reactively read all registered hotkeys from the singleton manager
  const { hotkeys } = useHotkeyRegistrations();

  // Keep activeTab in sync when scopes change (e.g. navigating)
  const currentTopScope = scopes[scopes.length - 1] ?? 'global';
  const effectiveTab = scopes.includes(activeTab) ? activeTab : currentTopScope;

  // Filter entries for the active tab scope
  const getEntriesForScope = (scope: string) => {
    let filtered = hotkeys
      .filter((reg) => {
        const regScope = reg.options.meta?.scope ?? 'global';
        return regScope === scope && reg.options.enabled !== false;
      });

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (reg) =>
          reg.hotkey.toLowerCase().includes(q) ||
          reg.options.meta?.description?.toLowerCase().includes(q) ||
          reg.options.meta?.group?.toLowerCase().includes(q),
      );
    }

    return filtered;
  };

  // Group entries by group name
  const groupEntries = (
    items: typeof hotkeys,
  ): Map<string, typeof hotkeys> => {
    const groups = new Map<string, typeof hotkeys>();
    for (const entry of items) {
      const key = entry.options.meta?.group ?? 'General';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(entry);
    }
    return groups;
  };

  const visibleEntries = getEntriesForScope(effectiveTab);
  const grouped = groupEntries(visibleEntries);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg"
        onEscapeKeyDown={() => onOpenChange(false)}
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>

        {/* Search bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 opacity-50 pointer-events-none" />
          <Input
            placeholder="Search shortcuts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Scope tabs */}
        <Tabs
          value={effectiveTab}
          onValueChange={(val) => {
            setActiveTab(val);
            setSearch('');
          }}
        >
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
            {scopes.map((scope) => (
              <TabsTrigger
                key={scope}
                value={scope}
                className="capitalize whitespace-nowrap"
              >
                {scope}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Empty state */}
          {grouped.size === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {search ? 'No shortcuts found' : 'No shortcuts for this scope'}
            </div>
          )}

          {/* Grouped shortcut list */}
          <div className="mt-3 max-h-80 space-y-4 overflow-y-auto pr-1">
            {[...grouped.entries()].map(([group, items]) => (
              <div key={group}>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {group}
                </p>
                <div className="space-y-1">
                  {items.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between py-1.5"
                    >
                      <span className="text-sm text-foreground/80">
                        {entry.options.meta?.description ?? entry.hotkey}
                      </span>
                      <KeyBadges hotkey={entry.hotkey} />
                    </div>
                  ))}
                </div>
                <Separator className="mt-3" />
              </div>
            ))}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
