import { MOCK_WORKSPACES } from '@/modules/workspace/data/mock-workspaces';
import { useWorkspaceStore } from '@/modules/workspace/stores/workspace.store';
import { WorkspaceRoutes } from '@/shared/constants';
import { cn } from '@/shared/utils';
import { useNavigate } from '@tanstack/react-router';
import { ChevronsUpDown, School } from 'lucide-react';

export function WorkspaceSwitcher() {
  const { currentWorkspaceId } = useWorkspaceStore();
  const navigate = useNavigate();

  const activeWorkspace =
    MOCK_WORKSPACES.find((ws) => ws.id === currentWorkspaceId) ??
    MOCK_WORKSPACES[0];

  return (
    <button
      type="button"
      onClick={() => navigate({ to: WorkspaceRoutes.list() })}
      className={cn(
        'group flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition-all',
        'hover:bg-surface-container-high/60',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
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
      <ChevronsUpDown className="size-4 shrink-0 text-on-surface-variant opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}
