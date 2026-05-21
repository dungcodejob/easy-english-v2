import { MOCK_WORKSPACES } from '@/modules/workspace/data/mock-workspaces';
import { useWorkspaceStore } from '@/modules/workspace/stores/workspace.store';
import { cn } from '@/shared/utils';
import { createFileRoute } from '@tanstack/react-router';
import { BookOpen, CheckCircle2, Lightbulb } from 'lucide-react';
import { useState } from 'react';

const CHART_BARS = [
  {
    label: 'Week 1',
    value: 42,
    heightPct: 40,
    color: 'bg-surface-container-low',
  },
  {
    label: 'Week 1',
    value: 55,
    heightPct: 55,
    color: 'bg-surface-container-low',
  },
  {
    label: 'Week 2',
    value: 48,
    heightPct: 48,
    color: 'bg-surface-container-low',
  },
  { label: 'Week 2', value: 75, heightPct: 75, color: 'bg-primary/20' },
  { label: 'Week 3', value: 82, heightPct: 82, color: 'bg-primary/40' },
  { label: 'Week 4', value: 95, heightPct: 95, color: 'bg-primary' },
];

const PROFICIENCY = [
  { label: 'Academic / Formal', pct: 65, color: 'bg-primary' },
  { label: 'Conversational', pct: 42, color: 'bg-secondary' },
  { label: 'Technical / Scientific', pct: 18, color: 'bg-tertiary-fixed-dim' },
  { label: 'Literary / Poetic', pct: 88, color: 'bg-on-primary-fixed-variant' },
];

// 21 days: true = studied, false = missed, null = today marker
const CALENDAR_DAYS: Array<{
  day: number;
  achieved: boolean;
  today?: boolean;
}> = [
  { day: 1, achieved: true },
  { day: 2, achieved: true },
  { day: 3, achieved: false },
  { day: 4, achieved: true },
  { day: 5, achieved: true },
  { day: 6, achieved: true },
  { day: 7, achieved: true },
  { day: 8, achieved: true },
  { day: 9, achieved: true },
  { day: 10, achieved: true },
  { day: 11, achieved: true },
  { day: 12, achieved: false },
  { day: 13, achieved: true },
  { day: 14, achieved: true },
  { day: 15, achieved: true },
  { day: 16, achieved: true, today: true },
  { day: 17, achieved: false },
  { day: 18, achieved: false },
  { day: 19, achieved: false },
  { day: 20, achieved: false },
  { day: 21, achieved: false },
];

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function ProgressPage() {
  const { currentWorkspaceId } = useWorkspaceStore();
  const workspace =
    MOCK_WORKSPACES.find((ws) => ws.id === currentWorkspaceId) ??
    MOCK_WORKSPACES[0];

  const [chartPeriod, setChartPeriod] = useState<'weekly' | 'monthly'>(
    'monthly',
  );

  const masteryPct =
    workspace.wordTarget > 0
      ? Math.round((workspace.wordCount / workspace.wordTarget) * 100)
      : 0;

  return (
    <main className="px-6 md:px-12 py-16 max-w-6xl mx-auto">
      {/* Hero Summary */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12 bg-surface-container-low p-8 md:p-12 rounded-xl relative overflow-hidden">
        <div className="flex-1 z-10">
          <span className="inline-block px-4 py-1 bg-tertiary-fixed text-on-tertiary-fixed rounded-full text-xs font-bold mb-4 tracking-widest uppercase">
            Weekly Achievement
          </span>
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-primary-fixed mb-4 leading-tight">
            Your linguistic sanctuary is thriving.
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">
            You've expanded your vocabulary by{' '}
            <span className="text-primary font-bold">127 words</span> this week.
            Your consistency in the{' '}
            <span className="font-bold text-on-surface">{workspace.name}</span>{' '}
            workspace has placed you in the top 5% of scholars. Keep this
            momentum — clarity follows focus.
          </p>
        </div>

        <div className="w-full md:w-1/3 aspect-square relative z-10 shrink-0">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-primary/20 to-secondary/10 backdrop-blur-3xl" />
          <img
            alt="Scholarly study"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvUO5nLze39Hvj6URkVtAJINiZaWr6xZhFwVROETpk3m6f97xY8YVgpwRPN8AIMog9Mnba1A9rJpflGoK9ujanMVMBEkQYvKZeNv3krXj90MuZ80hdmtGahbsaVJkUASa5e4L7mlMGqJiucM1MkFRUbFAgun51fFpuVLbmnlG1SOzlIJO-rV_rM1rTYgksX1JmjfOMj-oElqhvbG-HMScucTVaf67db3VojX68RE36VpHXwY1v9lBsJHMJsjQQpk0QVzT4PXwj1SU"
            className="w-full h-full object-cover rounded-xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500"
          />
        </div>

        {/* Background blob */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary-fixed-dim/30 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Key Stats Column */}
        <div className="md:col-span-4 flex flex-col gap-6">
          {/* Total Words */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_32px_rgba(26,27,30,0.06)] border border-outline-variant/10">
            <div className="flex justify-between items-start mb-6">
              <BookOpen className="size-8 text-primary" strokeWidth={1.5} />
              <span className="text-secondary font-bold text-sm bg-secondary-container/30 px-2 py-1 rounded">
                +12%
              </span>
            </div>
            <h3 className="text-on-surface-variant text-sm font-medium mb-1">
              Total Words Encountered
            </h3>
            <p className="font-headline text-4xl font-bold text-primary">
              {workspace.wordCount.toLocaleString()}
            </p>
            <div className="mt-4 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-[width] duration-700"
                style={{ width: `${masteryPct}%` }}
              />
            </div>
          </div>

          {/* Mastered Words */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_32px_rgba(26,27,30,0.06)] border border-outline-variant/10">
            <div className="flex justify-between items-start mb-6">
              <CheckCircle2
                className="size-8 text-tertiary-fixed-dim"
                strokeWidth={1.5}
              />
              <span className="text-on-surface-variant font-medium text-xs">
                85% retention
              </span>
            </div>
            <h3 className="text-on-surface-variant text-sm font-medium mb-1">
              Mastered Words
            </h3>
            <p className="font-headline text-4xl font-bold text-primary">
              {workspace.masteredCount.toLocaleString()}
            </p>
            <p className="text-xs text-on-surface-variant mt-4 leading-relaxed">
              You've moved 45 words from 'Learning' to 'Mastered' in the last 48
              hours.
            </p>
          </div>
        </div>

        {/* Learning Efficiency Chart */}
        <div className="md:col-span-8 bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_32px_rgba(26,27,30,0.06)] border border-outline-variant/10 flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-headline text-xl font-bold text-primary">
                Learning Efficiency
              </h3>
              <p className="text-on-surface-variant text-sm">
                Retention rate over the last 30 days
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setChartPeriod('weekly')}
                className={cn(
                  'px-3 py-1 text-xs font-bold rounded-full transition-colors',
                  chartPeriod === 'weekly'
                    ? 'bg-primary text-white'
                    : 'bg-surface-container text-on-surface-variant',
                )}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setChartPeriod('monthly')}
                className={cn(
                  'px-3 py-1 text-xs font-bold rounded-full transition-colors',
                  chartPeriod === 'monthly'
                    ? 'bg-primary text-white'
                    : 'bg-surface-container text-on-surface-variant',
                )}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Bar chart */}
          <div className="flex-1 flex items-end gap-2 min-h-[200px] mb-4">
            {CHART_BARS.map((bar, i) => (
              <div
                key={i}
                className={cn(
                  'flex-1 rounded-t-lg relative group transition-all duration-500',
                  bar.color,
                )}
                style={{ height: `${bar.heightPct}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-primary whitespace-nowrap">
                  {bar.value}%
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
          </div>
        </div>

        {/* Study Consistency Calendar */}
        <div className="md:col-span-7 bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_32px_rgba(26,27,30,0.06)] border border-outline-variant/10">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-headline text-xl font-bold text-primary">
              Study Consistency
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-surface-container inline-block" />
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">
                  Missed
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-tertiary-fixed-dim inline-block" />
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">
                  Achieved
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-3">
            {/* Day headers */}
            {WEEK_DAYS.map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-bold text-outline uppercase"
              >
                {d}
              </div>
            ))}

            {/* Day cells */}
            {CALENDAR_DAYS.map(({ day, achieved, today }) => (
              <div
                key={day}
                className={cn(
                  'aspect-square rounded-lg flex items-center justify-center font-headline font-bold text-sm relative',
                  achieved
                    ? 'bg-tertiary-fixed-dim text-on-tertiary-fixed'
                    : 'bg-surface-container text-on-surface-variant/30',
                  today && 'ring-4 ring-primary-container/10',
                )}
              >
                {day}
                {today && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full border-2 border-surface-container-lowest" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Proficiency Mix */}
        <div className="md:col-span-5 bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_32px_rgba(26,27,30,0.06)] border border-outline-variant/10">
          <h3 className="font-headline text-xl font-bold text-primary mb-6">
            Proficiency Mix
          </h3>
          <div className="space-y-6">
            {PROFICIENCY.map(({ label, pct, color }) => (
              <div key={label} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-on-surface">{label}</span>
                  <span className="text-on-surface-variant">{pct}%</span>
                </div>
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-[width] duration-700',
                      color,
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-surface-container-low rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
              <Lightbulb className="size-4" strokeWidth={1.75} />
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Try focused practice on{' '}
              <span className="text-primary font-bold">Technical</span> topics
              to balance your profile.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export const Route = createFileRoute('/_(authenticated)/progress')({
  component: ProgressPage,
});

export default ProgressPage;
