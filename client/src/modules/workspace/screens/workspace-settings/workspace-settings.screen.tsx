import { MOCK_WORKSPACES } from '@/modules/workspace/data/mock-workspaces';
import { useWorkspaceStore } from '@/modules/workspace/stores/workspace.store';
import { cn } from '@/shared/utils';
import { createFileRoute } from '@tanstack/react-router';
import {
  AlertTriangle,
  BookOpen,
  Brain,
  Clock,
  Edit3,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

type LearningMode = 'spaced' | 'immersion';

export const Route = createFileRoute('/_(authenticated)/workspace/settings')({
  component: WorkspaceSettingsScreen,
});

function WorkspaceSettingsScreen() {
  const { currentWorkspaceId } = useWorkspaceStore();
  const workspace =
    MOCK_WORKSPACES.find((ws) => ws.id === currentWorkspaceId) ??
    MOCK_WORKSPACES[0];

  const [name, setName] = useState(workspace.name);
  const [dailyTarget, setDailyTarget] = useState('20');
  const [reminderTime, setReminderTime] = useState('08:00 PM');
  const [learningMode, setLearningMode] = useState<LearningMode>('spaced');

  const streakPct = Math.min((workspace.streak / 30) * 100, 100);

  return (
    <main className="px-6 md:px-12 py-16 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="flex-1">
          <h1 className="font-headline text-5xl font-extrabold text-on-primary-fixed tracking-tight mb-4 leading-none">
            Workspace Settings
          </h1>
          <p className="text-on-surface-variant text-lg max-w-xl leading-relaxed">
            Tailor your intellectual environment. These preferences define the
            rhythm and rigor of your academic pursuit in the{' '}
            <span className="font-bold text-primary">{workspace.name}</span>{' '}
            workspace.
          </p>
        </div>

        <div className="relative group shrink-0">
          <div className="absolute -inset-1 bg-gradient-to-r from-tertiary-fixed-dim to-secondary-fixed rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
          <div className="relative w-48 h-48 bg-surface-container-lowest rounded-xl flex flex-col items-center justify-center p-6 shadow-sm border border-outline-variant/10">
            <BookOpen
              className="size-12 text-tertiary-fixed-dim mb-2"
              strokeWidth={1.5}
            />
            <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
              Active Module
            </span>
            <span className="text-sm font-semibold text-primary mt-1">
              Linguistics II
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 space-y-8">
          <section className="bg-surface-container-lowest p-10 rounded-xl shadow-[0_12px_32px_rgba(26,27,30,0.04)]">
            <h3 className="font-headline text-2xl font-bold text-primary mb-8 flex items-center gap-3">
              <Edit3 className="size-6 text-secondary" strokeWidth={1.75} />
              Core Identity
            </h3>
            <div className="space-y-10">
              <div className="group relative">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter workspace title..."
                  className="w-full font-headline text-2xl font-medium bg-transparent border-b border-outline-variant/30 focus:border-secondary focus:ring-0 transition-colors py-2 outline-none text-on-surface"
                />
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-focus-within:w-full" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div className="group relative">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                    Daily Target
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={dailyTarget}
                      onChange={(e) => setDailyTarget(e.target.value)}
                      placeholder="0"
                      className="w-20 font-headline text-2xl font-medium bg-transparent border-b border-outline-variant/30 focus:border-secondary focus:ring-0 transition-colors py-2 outline-none text-on-surface"
                    />
                    <span className="text-lg text-on-surface-variant font-medium">
                      words / day
                    </span>
                  </div>
                </div>

                <div className="group relative">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                    Study Reminder
                  </label>
                  <div className="flex items-center gap-3">
                    <Clock
                      className="size-5 text-on-surface-variant shrink-0"
                      strokeWidth={1.75}
                    />
                    <input
                      type="text"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      placeholder="e.g., 8:00 PM"
                      className="w-full font-headline text-2xl font-medium bg-transparent border-b border-outline-variant/30 focus:border-secondary focus:ring-0 transition-colors py-2 outline-none text-on-surface"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest p-10 rounded-xl shadow-[0_12px_32px_rgba(26,27,30,0.04)]">
            <h3 className="font-headline text-2xl font-bold text-primary mb-8 flex items-center gap-3">
              <Brain className="size-6 text-secondary" strokeWidth={1.75} />
              Learning Methodology
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setLearningMode('spaced')}
                className={cn(
                  'relative flex flex-col p-6 rounded-lg border-2 cursor-pointer transition-all text-left',
                  learningMode === 'spaced'
                    ? 'border-primary-container bg-surface-container-low'
                    : 'border-outline-variant/20 hover:bg-surface-container-low',
                )}
              >
                <div className="flex justify-between mb-4">
                  <Brain
                    className={cn(
                      'size-8',
                      learningMode === 'spaced'
                        ? 'text-primary'
                        : 'text-on-surface-variant',
                    )}
                    strokeWidth={1.5}
                  />
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                      learningMode === 'spaced'
                        ? 'border-primary'
                        : 'border-outline-variant',
                    )}
                  >
                    {learningMode === 'spaced' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
                <span className="font-headline text-lg font-bold text-primary">
                  Spaced Repetition
                </span>
                <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                  Optimize long-term retention using the Ebbinghaus Forgetting
                  Curve algorithm.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLearningMode('immersion')}
                className={cn(
                  'relative flex flex-col p-6 rounded-lg border-2 cursor-pointer transition-all text-left',
                  learningMode === 'immersion'
                    ? 'border-primary-container bg-surface-container-low'
                    : 'border-outline-variant/20 hover:bg-surface-container-low',
                )}
              >
                <div className="flex justify-between mb-4">
                  <Zap
                    className={cn(
                      'size-8',
                      learningMode === 'immersion'
                        ? 'text-primary'
                        : 'text-on-surface-variant',
                    )}
                    strokeWidth={1.5}
                  />
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                      learningMode === 'immersion'
                        ? 'border-primary'
                        : 'border-outline-variant',
                    )}
                  >
                    {learningMode === 'immersion' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
                <span className="font-headline text-lg font-bold text-on-surface">
                  Immersion Sprint
                </span>
                <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                  High-frequency exposure designed for rapid contextual
                  vocabulary acquisition.
                </p>
              </button>
            </div>
          </section>
        </div>

        <div className="md:col-span-4 space-y-8">
          <div className="rounded-xl overflow-hidden relative h-64 shadow-lg group">
            <img
              alt="Library"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAB6AV_HOEpsCJnv5owfcT3lKbY_vqBEZImV65adcbp8bM9DsYqKAWchgdy1pz5VGoGSPwwNnpj_hwtDyxvzE_gxMgnb5AaEGytCJ-dN3q1_anwTVh8EiPEUaDMZsB4uUzw3k4eaddS7-5Rp2_CTrY0FWVflZae4yfu1-Ly_quS_21t6XpOCRX7C-wdi3r2ZQzEneh8ClxODFBP2_JWt7DmCZq75oPOZp0BRULeTl0ErL-RG1Vf2PAQbitEKBL-zz7Yh_plQzB0lJM"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-8">
              <div className="text-white">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">
                  Current Milestone
                </p>
                <h4 className="font-headline text-2xl font-bold">
                  Archaic Latin Texts
                </h4>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-highest/30 backdrop-blur-md p-8 rounded-xl border border-white/40">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-headline font-bold text-primary">
                Target Velocity
              </h4>
              <span className="text-xs bg-tertiary-fixed text-on-tertiary-fixed px-2 py-1 rounded-full font-bold">
                Lvl 14
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-on-surface-variant">Daily Streak</span>
                <span className="font-bold text-primary">
                  {workspace.streak} Days
                </span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-tertiary-fixed-dim rounded-full transition-[width] duration-700"
                  style={{ width: `${streakPct}%` }}
                />
              </div>
              <p className="text-[11px] text-on-surface-variant italic leading-relaxed">
                "Success is the sum of small efforts, repeated day in and day
                out."
              </p>
            </div>
          </div>

          <div className="p-8 rounded-xl bg-error-container/20 border border-error/10">
            <h4 className="font-headline text-sm font-bold text-on-error-container mb-4 flex items-center gap-2">
              <AlertTriangle className="size-4" strokeWidth={1.75} />
              Danger Zone
            </h4>
            <button
              type="button"
              className="w-full py-3 rounded-full border border-error/30 text-error text-xs font-bold hover:bg-error hover:text-white transition-all"
            >
              Archive Workspace
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-outline-variant/10 flex justify-between items-center">
        <button
          type="button"
          className="text-on-primary-fixed-variant text-sm font-bold hover:underline"
        >
          Discard Changes
        </button>
        <button
          type="button"
          className="px-10 py-4 rounded-full bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold shadow-xl hover:scale-105 transition-transform"
        >
          Save Workspace Preferences
        </button>
      </div>
    </main>
  );
}

export default WorkspaceSettingsScreen;
