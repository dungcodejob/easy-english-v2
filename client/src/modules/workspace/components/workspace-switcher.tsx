import {
  MOCK_WORKSPACES,
  type WorkspacePreview,
} from '@/modules/workspace/data/mock-workspaces';
import { useWorkspaceStore } from '@/modules/workspace/stores/workspace.store';
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/shared/ui/shadcn/popover';
import { cn } from '@/shared/utils';
import {
  BookOpen,
  BrainCircuit,
  ChevronsUpDown,
  Flame,
  ListChecks,
  School,
} from 'lucide-react';
import { useState } from 'react';

export function WorkspaceSwitcher() {
  const { currentWorkspaceId, setCurrentWorkspaceId } = useWorkspaceStore();
  const [open, setOpen] = useState(false);

  const activeWorkspace =
    MOCK_WORKSPACES.find((ws) => ws.id === currentWorkspaceId) ??
    MOCK_WORKSPACES[0];

  const totalWords = MOCK_WORKSPACES.reduce((sum, ws) => sum + ws.wordCount, 0);
  const totalMastered = MOCK_WORKSPACES.reduce(
    (sum, ws) => sum + ws.masteredCount,
    0,
  );
  const totalReviewDue = MOCK_WORKSPACES.reduce(
    (sum, ws) => sum + ws.reviewDueCount,
    0,
  );
  const maxStreak = Math.max(...MOCK_WORKSPACES.map((ws) => ws.streak), 0);

  const handleSwitch = (ws: WorkspacePreview) => {
    setCurrentWorkspaceId(ws.id);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'group flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition-all',
            'hover:bg-surface-container-high/60',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            'data-[state=open]:bg-surface-container-high data-[state=open]:shadow-sm',
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white shadow-sm shrink-0 transition-transform group-hover:scale-105 group-active:scale-95">
            <School className="size-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h2 className="font-headline font-bold text-primary leading-none truncate">
              {activeWorkspace.name}
            </h2>
            <p className="text-[10px] text-on-surface-variant font-medium truncate mt-1">
              {activeWorkspace.plan}
            </p>
          </div>
          <ChevronsUpDown className="size-4 shrink-0 text-on-surface-variant opacity-0 transition-opacity group-hover:opacity-100 group-data-[state=open]:opacity-100" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[480px] max-h-[600px] overflow-y-auto p-0"
        align="start"
        sideOffset={8}
      >
        <PopoverHeader className="sticky top-0 z-10 border-b border-outline-variant/20 bg-surface p-5">
          <PopoverTitle className="font-headline text-xl font-bold text-on-surface">
            Switch Workspace
          </PopoverTitle>
        </PopoverHeader>

        <div className="p-5">
          {/* Workspace cards grid */}
          <div className="mb-6 grid grid-cols-1 gap-4">
            {MOCK_WORKSPACES.map((ws) => {
              const progress =
                ws.wordCount > 0 ? (ws.masteredCount / ws.wordCount) * 100 : 0;

              return (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => handleSwitch(ws)}
                  className={cn(
                    'group relative flex flex-col gap-3 rounded-2xl border p-6 text-left transition-shadow',
                    'hover:shadow-md hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    ws.isActive
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-outline-variant/20 bg-surface-container',
                  )}
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-headline text-lg font-semibold text-on-surface leading-tight">
                      {ws.name}
                    </span>
                    {ws.isActive && (
                      <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs font-medium">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Stats row */}
                  <span className="text-sm text-on-surface-variant">
                    {ws.wordCount} words · {ws.masteredCount} mastered
                  </span>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                    <div
                      className="h-full rounded-full bg-secondary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Stats summary grid */}
          <div className="rounded-2xl bg-surface-container p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-on-surface-variant">
              Your Stats
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center gap-1 rounded-2xl bg-surface-container p-5 text-center">
                <ListChecks className="size-4 text-on-surface-variant" />
                <span className="font-headline text-2xl font-bold text-primary">
                  {totalWords}
                </span>
                <span className="text-xs text-on-surface-variant">Words</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-2xl bg-surface-container p-5 text-center">
                <BookOpen className="size-4 text-on-surface-variant" />
                <span className="font-headline text-2xl font-bold text-primary">
                  {totalMastered}
                </span>
                <span className="text-xs text-on-surface-variant">
                  Mastered
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-2xl bg-surface-container p-5 text-center">
                <BrainCircuit className="size-4 text-on-surface-variant" />
                <span className="font-headline text-2xl font-bold text-primary">
                  {totalReviewDue}
                </span>
                <span className="text-xs text-on-surface-variant">Review</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-2xl bg-surface-container p-5 text-center">
                <Flame className="size-4 text-secondary" />
                <span className="font-headline text-2xl font-bold text-primary">
                  {maxStreak}
                </span>
                <span className="text-xs text-on-surface-variant">
                  Day Streak
                </span>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
