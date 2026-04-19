import {
  MOCK_WORKSPACES,
  type WorkspacePreview,
} from '@/modules/workspace/data/mock-workspaces';
import { useWorkspaceStore } from '@/modules/workspace/stores/workspace.store';
import { DashboardRoutes, WorkspaceRoutes } from '@/shared/constants';
import { CTAButton } from '@/shared/ui/semantic';
import { cn } from '@/shared/utils';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  BookMarked,
  Medal,
  Plus,
  PlusCircle,
  Sparkles,
  Timer,
} from 'lucide-react';

const ACCENT_STYLES: Record<
  WorkspacePreview['accent'],
  { bar: string; mastery: string }
> = {
  primary: {
    bar: 'from-secondary to-secondary-fixed',
    mastery: 'text-secondary',
  },
  container: {
    bar: 'from-primary-container to-primary-fixed-dim',
    mastery: 'text-on-primary-container',
  },
  tertiary: {
    bar: 'from-tertiary-fixed-dim to-tertiary-fixed',
    mastery: 'text-tertiary-fixed-dim',
  },
};

function WorkspacesPage() {
  const navigate = useNavigate();
  const { currentWorkspaceId, setCurrentWorkspaceId } = useWorkspaceStore();

  const handleSwitch = (ws: WorkspacePreview) => {
    setCurrentWorkspaceId(ws.id);
    navigate({ to: DashboardRoutes.list() });
  };

  const handleCreate = () => {
    navigate({ to: WorkspaceRoutes.new() });
  };

  return (
    <main className="px-6 md:px-12 py-16 max-w-7xl mx-auto">
      {/* Hero header */}
      <section className="mb-16 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <span className="text-secondary font-headline font-semibold tracking-[0.2em] text-sm uppercase mb-4 block">
              Select Your Journey
            </span>
            <h1 className="font-headline text-5xl md:text-6xl font-black text-on-primary-fixed leading-[1.05] tracking-tighter">
              Your Learning Sanctuary.
            </h1>
            <p className="mt-6 text-on-surface-variant text-lg leading-relaxed font-light">
              Switch between your specialized academic environments or create a
              new space for focused inquiry.
            </p>
          </div>
          <CTAButton onClick={handleCreate} endIcon={<PlusCircle />}>
            New Workspace
          </CTAButton>
        </div>
      </section>

      {/* Workspace grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_WORKSPACES.map((ws) => {
          const isActive = ws.id === currentWorkspaceId || ws.isActive;
          const mastery =
            ws.wordTarget > 0
              ? Math.round((ws.wordCount / ws.wordTarget) * 100)
              : 0;
          const accent = ACCENT_STYLES[ws.accent];
          const Icon = ws.icon;

          return (
            <button
              key={ws.id}
              type="button"
              onClick={() => handleSwitch(ws)}
              className={cn(
                'group text-left bg-surface-container-lowest rounded-xl p-8',
                'shadow-[0_12px_32px_rgba(26,27,30,0.06)] hover:shadow-[0_20px_48px_rgba(26,27,30,0.12)]',
                'transition-all duration-500 flex flex-col justify-between',
                isActive ? 'border-b-4 border-primary' : 'hover:-translate-y-2',
              )}
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-surface-container-low rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                    <Icon className="size-7" strokeWidth={1.75} />
                  </div>
                  {isActive && (
                    <span className="px-4 py-1 bg-primary-fixed text-on-primary-fixed rounded-full text-[10px] font-bold font-headline uppercase tracking-[0.18em]">
                      Active
                    </span>
                  )}
                </div>
                <h3 className="font-headline text-2xl font-bold text-on-surface mb-2">
                  {ws.name}
                </h3>
                <p className="text-on-surface-variant text-sm mb-8 line-clamp-2">
                  {ws.description}
                </p>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-on-surface-variant text-[10px] font-headline uppercase tracking-[0.18em] mb-1">
                      Words Learned
                    </span>
                    <span className="font-headline text-xl font-black text-on-surface">
                      {ws.wordCount.toLocaleString()}{' '}
                      <span className="text-sm font-normal text-on-surface-variant">
                        / {ws.wordTarget.toLocaleString()}
                      </span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-on-surface-variant text-[10px] font-headline uppercase tracking-[0.18em] mb-1 block">
                      Mastery
                    </span>
                    <span
                      className={cn(
                        'font-headline text-xl font-black',
                        accent.mastery,
                      )}
                    >
                      {mastery}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-surface-container-high h-3 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full bg-gradient-to-r transition-[width] duration-700',
                      accent.bar,
                    )}
                    style={{ width: `${mastery}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}

        {/* Create New Space (dashed) */}
        <button
          type="button"
          onClick={handleCreate}
          className="group border-2 border-dashed border-outline-variant bg-transparent rounded-xl p-8 hover:bg-surface-container-low transition-all duration-500 flex items-center justify-center min-h-[320px]"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center text-on-surface-variant mx-auto mb-4 group-hover:bg-primary-container group-hover:text-white transition-all duration-500">
              <Plus className="size-8" strokeWidth={2} />
            </div>
            <h3 className="font-headline text-xl font-bold text-on-surface-variant">
              Create New Space
            </h3>
            <p className="text-on-surface-variant text-sm mt-2 max-w-[200px] mx-auto">
              Define a new goal for your linguistic growth.
            </p>
          </div>
        </button>
      </section>

      {/* Inspirational section */}
      <section className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative rounded-xl overflow-hidden shadow-2xl h-[400px]">
          <img
            alt="Grand classical library"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSj0n6AZK54eO2H2U1v2_dZOlhJx39uJBUwf8rzMRamYcsZxZpMGxSvSaj19KEl8-pajyBjnHyvfG2UMThq7xUKy3XDtWwYlj7n_smZXODqcnH0VykVfPSm52p0OwF_MrBeymz5qzs4TxQvERAbDkJsePfjJDK_XX96ekYUve4wjkEtKKyGaqREceUxNYzhnoWbrczRCYy1LdkIAGNZMu1y3vKzdinjkW3dzl4SOnWU5WAbnTdHAgqgnF7qIOEwzYqVthbWSMA1FU"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent flex flex-col justify-end p-10">
            <h2 className="font-headline text-3xl font-black text-white leading-tight">
              Focus is the key to deep mastery.
            </h2>
            <p className="text-primary-fixed mt-4 font-light italic">
              "The limit of my language is the limit of my world." —
              Wittgenstein
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <StatCard
            icon={<Timer className="size-8 text-secondary" />}
            label="Study Streak"
            value="14 Days"
          />
          <StatCard
            icon={<Medal className="size-8 text-tertiary-fixed-dim" />}
            label="Rank"
            value="Scholar"
          />
          <StatCard
            icon={<Sparkles className="size-8 text-on-primary-container" />}
            label="New Insights"
            value="28"
          />
          <StatCard
            icon={<BookMarked className="size-8 text-primary" />}
            label="Review Ready"
            value="112"
          />
        </div>
      </section>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-surface-container-low p-6 rounded-xl">
      <div className="mb-4">{icon}</div>
      <h4 className="font-headline text-on-surface font-bold mb-2">{label}</h4>
      <p className="font-headline text-3xl font-black text-on-surface">
        {value}
      </p>
    </div>
  );
}

export const Route = createFileRoute('/_(authenticated)/workspace')({
  component: WorkspacesPage,
});

export default WorkspacesPage;
