/**
 * DashboardPage — Scholarly Sanctuary dashboard
 *
 * Layout matches the "Scholarly Sanctuary" HTML mockup:
 * Hero greeting + Quick Start CTA, 3-col stat bento (Study Streak,
 * Words Due, Daily Goal), Learning Progress bar chart (8-col) +
 * Recent Topics sidebar (4-col), full-width promotional banner.
 *
 * [MOCK] All data is hardcoded — replace with real API hooks when available.
 * [MOCK] Bar chart is pure CSS — replace with a charting library if needed.
 */

import { DictionaryRoutes, TopicRoutes } from '@/shared/constants';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  ChevronRight,
  Flame,
  FlaskConical,
  Gavel,
  Landmark,
  Play,
  Zap,
} from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';

export const Route = createFileRoute('/_(authenticated)/dashboard')({
  component: DashboardPage,
});

// [MOCK] Weekly chart data — backend does not support this yet
const WEEKLY_DATA = [
  { day: 'MON', learned: 40, mastered: 25 },
  { day: 'TUE', learned: 60, mastered: 45 },
  { day: 'WED', learned: 85, mastered: 55 },
  { day: 'THU', learned: 50, mastered: 30 },
  { day: 'FRI', learned: 75, mastered: 65 },
  { day: 'SAT', learned: 30, mastered: 20 },
  { day: 'SUN', learned: 45, mastered: 35 },
];

// [MOCK] Recent topics — backend does not support this yet
const RECENT_TOPICS = [
  {
    title: 'Modern Architecture',
    mastery: 85,
    icon: Landmark,
    bgColor: 'bg-primary-fixed',
    textColor: 'text-primary',
  },
  {
    title: 'Molecular Biology',
    mastery: 32,
    icon: FlaskConical,
    bgColor: 'bg-secondary-fixed',
    textColor: 'text-on-secondary-fixed-variant',
  },
  {
    title: 'International Law',
    mastery: 12,
    icon: Gavel,
    bgColor: 'bg-tertiary-fixed',
    textColor: 'text-on-tertiary-fixed-variant',
  },
];

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 px-6 pb-12 pt-6 md:px-8">
      {/* ── Hero Greeting ─────────────────────────────────────────── */}
      <section className="relative mb-4 flex items-center justify-between">
        <div className="max-w-2xl">
          <h2 className="mb-4 font-headline text-5xl font-extrabold tracking-tight text-on-primary-fixed">
            {t('dashboard.welcome', { name: 'Scholar' })}
          </h2>
          <p className="text-lg leading-relaxed text-on-surface-variant">
            <Trans
              i18nKey="dashboard.review_status"
              values={{ count: 42 }}
              components={[<span key="0" className="font-bold text-primary" />]}
            />
          </p>
        </div>
        <button className="flex items-center gap-3 rounded-full bg-gradient-to-br from-primary to-primary-container px-10 py-5 font-headline text-lg font-bold text-white shadow-lg transition-all hover:shadow-primary-container/20 active:scale-95">
          <Play className="h-5 w-5" fill="currentColor" />
          {t('dashboard.start_review')}
        </button>
      </section>

      {/* ── Stats Bento Grid (3-col) ──────────────────────────────── */}
      <div className="grid grid-cols-12 gap-8">
        {/* Study Streak */}
        <div className="group relative col-span-12 overflow-hidden rounded-xl bg-surface-container-lowest p-8 shadow-sm transition-all hover:shadow-md md:col-span-4">
          {/* Watermark icon */}
          <div className="absolute right-0 top-0 p-8 opacity-10 transition-opacity group-hover:opacity-20">
            <Flame className="h-[120px] w-[120px]" fill="currentColor" />
          </div>
          <div>
            <p className="mb-1 text-sm font-medium uppercase tracking-widest text-on-surface-variant">
              Study Streak
            </p>
            <h3 className="font-headline text-6xl font-black text-on-primary-fixed">
              07{' '}
              <span className="text-xl font-medium text-on-surface-variant">
                Days
              </span>
            </h3>
          </div>
          <div className="mt-8">
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
              <div className="h-full w-[70%] rounded-full bg-tertiary-fixed-dim" />
            </div>
          </div>
          <p className="mt-4 text-xs font-medium italic text-on-surface-variant">
            Keep going! You're in the top 5% this week.
          </p>
        </div>

        {/* Words Due */}
        <div className="col-span-12 rounded-xl border-l-8 border-secondary bg-surface-container-lowest p-8 shadow-sm transition-all hover:shadow-md md:col-span-4">
          <p className="mb-1 text-sm font-medium uppercase tracking-widest text-on-surface-variant">
            Words Due
          </p>
          <h3 className="font-headline text-6xl font-black text-secondary">
            42
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
            Most are from{' '}
            <span className="font-bold text-on-surface">"Academic Verbs"</span>{' '}
            topic. Review now to ensure long-term retention.
          </p>
          <div className="mt-6 flex -space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary-fixed text-[10px] font-bold">
              A
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-secondary-fixed text-[10px] font-bold">
              B
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-tertiary-fixed text-[10px] font-bold">
              C
            </div>
          </div>
        </div>

        {/* Daily Goal — dark primary card */}
        <div className="group relative col-span-12 overflow-hidden rounded-xl bg-primary p-8 text-white shadow-lg md:col-span-4">
          <div className="relative z-10">
            <p className="mb-1 text-sm font-medium uppercase tracking-widest text-on-primary-container">
              {t('dashboard.daily_goal')}
            </p>
            <h3 className="mb-6 font-headline text-3xl font-bold">
              85% {t('dashboard.completed')}
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Words Learned</span>
                <span>12/15</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[80%] rounded-full bg-white" />
              </div>
            </div>
          </div>
          {/* Decorative corner circle */}
          <div className="absolute -mb-8 -mr-8 bottom-0 right-0 h-32 w-32 rounded-tl-full bg-white/5" />
        </div>

        {/* ── Learning Progress Chart (8-col) ─────────────────────── */}
        <div className="col-span-12 rounded-xl bg-surface-container-low p-10 md:col-span-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h4 className="font-headline text-2xl font-bold text-on-primary-fixed">
                Learning Progress
              </h4>
              <p className="text-sm text-on-surface-variant">
                Comparison of words discovered vs. mastery levels reached.
              </p>
            </div>
            <div className="flex gap-6 text-xs font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span>Learned</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-tertiary-fixed-dim" />
                <span>Mastered</span>
              </div>
            </div>
          </div>

          {/* [MOCK] Pure CSS bar chart */}
          <div className="flex h-64 items-end gap-6 px-4">
            {WEEKLY_DATA.map(({ day, learned, mastered }) => {
              // Today (WED in mock) gets solid bars, others get translucent + hover
              const isToday = day === 'WED';
              return (
                <div
                  key={day}
                  className="group flex flex-1 flex-col items-center gap-2"
                >
                  <div className="flex h-full w-full items-end gap-1">
                    <div
                      className={`flex-1 rounded-t-lg transition-all ${
                        isToday
                          ? 'bg-primary'
                          : 'bg-primary/20 group-hover:bg-primary/40'
                      }`}
                      style={{ height: `${learned}%` }}
                    />
                    <div
                      className={`flex-1 rounded-t-lg transition-all ${
                        isToday
                          ? 'bg-tertiary-fixed-dim'
                          : 'bg-tertiary-fixed-dim/20 group-hover:bg-tertiary-fixed-dim/40'
                      }`}
                      style={{ height: `${mastered}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-on-surface-variant">
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Recent Topics Sidebar (4-col) ───────────────────────── */}
        <div className="col-span-12 flex flex-col gap-8 md:col-span-4">
          <div className="flex-1 rounded-xl bg-surface-container-highest p-8">
            <h4 className="mb-6 font-headline text-xl font-bold text-on-primary-fixed">
              {t('dashboard.recent_topics')}
            </h4>
            <div className="space-y-4">
              {RECENT_TOPICS.map((topic) => (
                <Link
                  key={topic.title}
                  to={TopicRoutes.list()}
                  className="group flex cursor-pointer items-center justify-between rounded-xl border border-transparent bg-surface-container-lowest p-4 transition-colors hover:border-outline-variant/30 hover:bg-white"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${topic.bgColor} ${topic.textColor}`}
                    >
                      <topic.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{topic.title}</p>
                      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                        {topic.mastery}% Mastered
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-on-surface-variant transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Full-width Promotional Banner ───────────────────────── */}
        <div className="col-span-12">
          <div className="group relative h-64 overflow-hidden rounded-xl">
            {/* Gradient background simulating the library image */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/60 via-surface-container to-secondary-fixed/40" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent" />

            {/* Overlay with CTA */}
            <div className="absolute inset-0 flex items-center bg-gradient-to-r from-primary/90 to-transparent p-12">
              <div className="max-w-md">
                <h4 className="mb-2 font-headline text-3xl font-bold text-white">
                  Philosophy Weekend
                </h4>
                <p className="mb-6 text-primary-fixed">
                  Join our live deep-dive into the terminology of Existentialism
                  this Saturday.
                </p>
                <Link
                  to={DictionaryRoutes.search()}
                  className="rounded-full bg-white px-8 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary-fixed"
                >
                  Register Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FAB: Quick Practice ───────────────────────────────────── */}
      <button className="fixed bottom-8 right-8 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-tertiary-fixed-dim text-on-tertiary-fixed shadow-2xl transition-all hover:scale-110 active:scale-95">
        <Zap className="h-7 w-7" fill="currentColor" />
      </button>
    </div>
  );
}
