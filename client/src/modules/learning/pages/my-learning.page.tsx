/**
 * MyLearningPage — Study Hub
 *
 * Layout matches the "Scholarly Sanctuary — Study Hub" HTML mockup:
 * Asymmetric hero header with "Resume Last Session" pill, prominent
 * Words Due banner (dark primary-container), bento grid study modes
 * (Daily Review large card, Speed Quiz, Study by Topic, Achievement),
 * footer quote + CTAs, vocabulary list.
 *
 * [MOCK] Achievement milestone — backend does not support this yet.
 * [MOCK] "Currently studying" avatars in Daily Review card.
 * [MOCK] Speed Quiz weekly progress — UI only.
 */

import { useTopics } from '@/modules/topic/hooks/use-topics';
import { LearnRoutes, TopicRoutes } from '@/shared/constants';
import { DsSpinner } from '@/shared/ui';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  ChevronRight,
  FolderOpen,
  Play,
  Plane,
  Shield,
  Timer,
  UtensilsCrossed,
} from 'lucide-react';
import { useState } from 'react';
import { LearningList } from '../components/learning-list';
import { useDueCards } from '../hooks/use-due-cards';
import { useStartSession } from '../hooks/use-start-session';

export const Route = createFileRoute('/_(authenticated)/learning')({
  component: MyLearningPage,
});

export default function MyLearningPage() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { data: dueData, isLoading: loadingDue } = useDueCards();
  const { data: topicsData, isLoading: loadingTopics } = useTopics(1, 8);
  const [studyType] = useState<'FLASHCARD' | 'QUIZ'>('FLASHCARD');
  const startMutation = useStartSession();

  const dueCount = dueData?.data?.total ?? 0;
  const topics = topicsData?.data ?? [];

  const handleStartReview = () =>
    startMutation.mutate({ scope: 'DUE', studyType });

  const handleStudyTopic = (topicId: string) => {
    navigate({
      to: LearnRoutes.study(),
      search: { mode: 'topic', topicId, index: 0 },
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 pb-12 pt-6 md:px-8">
      {/* ── Header Hero (Asymmetric) ──────────────────────────────── */}
      <header className="mb-16 flex flex-col items-end justify-between gap-8 pt-8 md:flex-row">
        <div className="flex-1">
          <h1 className="mb-4 font-headline text-5xl font-extrabold leading-tight tracking-tight text-on-primary-fixed lg:text-6xl">
            Easy English <br />
            <span className="font-light text-on-primary-container">
              Study Hub
            </span>
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-on-surface-variant">
            Welcome back, Scholar. Your linguistic sanctuary is prepared for
            today's immersion.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <button className="group flex items-center gap-4 rounded-full bg-surface-container-lowest p-2 pl-6 pr-2 shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-col items-start pr-8">
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Current Status
              </span>
              <span className="font-semibold text-primary">
                Resume Last Session
              </span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-white transition-transform group-hover:translate-x-1">
              <Play className="h-5 w-5" fill="currentColor" />
            </div>
          </button>
        </div>
      </header>

      {/* ── Prominent Due Section ─────────────────────────────────── */}
      <section className="mb-16">
        <div className="group relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-xl bg-primary-container p-8 md:flex-row lg:p-12">
          {/* Background texture */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-10" />

          <div className="relative z-10">
            <h2 className="mb-2 font-headline text-3xl font-bold text-on-tertiary">
              Words Due Today
            </h2>
            <p className="text-lg text-on-primary-container">
              Your memory is prime for reinforcement. Don't let the curve drop.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-6">
            {/* Due count */}
            <div className="text-center">
              <div className="font-headline text-6xl font-extrabold text-tertiary-fixed-dim">
                {loadingDue ? <DsSpinner size="lg" /> : dueCount}
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-on-primary-container">
                Vocabulary
              </div>
            </div>
            <div className="h-16 w-px bg-white/20" />
            {/* [MOCK] Phrases count — backend does not track this separately */}
            <div className="text-center">
              <div className="font-headline text-6xl font-extrabold text-secondary-fixed">
                12
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-on-primary-container">
                Phrases
              </div>
            </div>
            <button
              onClick={handleStartReview}
              disabled={loadingDue || dueCount === 0}
              className="ml-4 rounded-full bg-tertiary-fixed-dim px-10 py-5 font-bold text-tertiary shadow-xl transition-transform hover:scale-105 disabled:opacity-50"
            >
              Start Review
            </button>
          </div>
        </div>
      </section>

      {/* ── Bento Grid Study Modes ────────────────────────────────── */}
      <section className="mb-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {/* Daily Review — Large Action Card (2-col) */}
          <div className="group relative flex h-96 cursor-pointer flex-col justify-end overflow-hidden rounded-xl border border-transparent bg-surface-container-low p-8 transition-all hover:border-outline-variant/20 md:col-span-2">
            {/* Background gradient layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/50 via-surface-container to-secondary-fixed/30 opacity-40 transition-opacity group-hover:opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />

            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-2 text-tertiary-fixed-dim">
                <Shield className="h-5 w-5" fill="currentColor" />
                <span className="text-sm font-bold uppercase tracking-widest">
                  Spaced Repetition
                </span>
              </div>
              <h3 className="mb-2 font-headline text-4xl font-bold text-white">
                Daily Review
              </h3>
              <p className="mb-6 max-w-md text-lg text-on-primary-container">
                Scientific algorithms tailored to your individual learning pace.
                Maintain your streak.
              </p>
              {/* [MOCK] Avatars — UI only */}
              <div className="flex gap-4">
                <div className="flex -space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-primary-fixed text-[10px] font-bold">
                    A
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-secondary-fixed text-[10px] font-bold">
                    B
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-primary-container text-[10px] text-white">
                    +12k
                  </div>
                </div>
                <span className="self-center text-sm text-white/60">
                  Currently studying
                </span>
              </div>
            </div>
          </div>

          {/* Speed Quiz */}
          <div className="group flex cursor-pointer flex-col overflow-hidden rounded-xl bg-secondary-container p-8 transition-all hover:shadow-2xl">
            <div className="flex flex-1 items-center justify-center">
              <Timer className="h-20 w-20 text-on-secondary-container opacity-20 transition-transform group-hover:scale-110" />
            </div>
            <div>
              <h3 className="mb-2 font-headline text-2xl font-bold text-on-secondary-container">
                Speed Quiz
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-on-secondary-fixed-variant">
                Pressure-test your recall under time constraints. Level up your
                fluency speed.
              </p>
              {/* [MOCK] Weekly progress — UI only */}
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/30">
                <div className="h-full w-3/4 bg-secondary" />
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-xs font-bold text-on-secondary-container">
                  Weekly Progress
                </span>
                <span className="text-xs font-bold text-on-secondary-container">
                  75%
                </span>
              </div>
            </div>
          </div>

          {/* Study by Topic */}
          <div className="flex flex-col gap-6 rounded-xl border border-transparent bg-surface-container-lowest p-8 shadow-sm transition-all hover:border-outline-variant/15 md:col-span-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tertiary-fixed text-on-tertiary-fixed">
              <FolderOpen className="h-6 w-6" />
            </div>
            <div>
              <h3 className="mb-2 font-headline text-2xl font-bold text-on-surface">
                Study by Topic
              </h3>
              <p className="mb-8 text-sm text-on-surface-variant">
                Deep dive into specific contexts from business meetings to
                casual dining.
              </p>

              {loadingTopics ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-12 animate-pulse rounded-xl bg-surface-container-low"
                    />
                  ))}
                </div>
              ) : topics.length === 0 ? (
                <ul className="space-y-4">
                  {/* Fallback static items when no topics exist */}
                  {[
                    { icon: Briefcase, label: 'Professional' },
                    { icon: UtensilsCrossed, label: 'Gastronomy' },
                    { icon: Plane, label: 'Travel Logistics' },
                  ].map(({ icon: Icon, label }) => (
                    <li
                      key={label}
                      className="flex cursor-pointer items-center justify-between rounded-xl p-3 transition-colors hover:bg-surface-container-low"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-outline-variant" />
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-4">
                  {topics.slice(0, 3).map((topic) => (
                    <li
                      key={topic.id}
                      onClick={() => handleStudyTopic(topic.id)}
                      className="flex cursor-pointer items-center justify-between rounded-xl p-3 transition-colors hover:bg-surface-container-low"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">
                          {topic.name}
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-outline-variant" />
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Link
              to={TopicRoutes.list()}
              className="group mt-auto flex items-center justify-between border-b border-outline-variant/30 py-3 text-sm font-bold text-on-primary-fixed-variant"
            >
              Explore all topics
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Recent Achievement — [MOCK] */}
          <div className="group relative overflow-hidden rounded-xl bg-surface-container-highest p-8 md:col-span-2">
            <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-tertiary-fixed to-tertiary-fixed-dim shadow-inner">
                <Award className="h-14 w-14 text-on-tertiary-fixed" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="mb-1 font-headline text-xl font-bold text-on-surface">
                  New Milestone Unlocked
                </h4>
                <p className="mb-4 text-on-surface-variant">
                  You've mastered over 500 essential business verbs. You're
                  ready for the "Executive" track.
                </p>
                <button className="rounded-full bg-on-surface px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-primary">
                  View Certificate
                </button>
              </div>
            </div>
            {/* Decorative blur */}
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          </div>
        </div>
      </section>

      {/* ── Vocabulary List ───────────────────────────────────────── */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
            Your Vocabulary
          </span>
        </div>
        <LearningList page={page} onPageChange={setPage} />
      </section>

      {/* ── Footer Quote + CTAs ───────────────────────────────────── */}
      <footer className="mt-24 pb-12 text-center">
        <div className="inline-flex flex-col items-center gap-6">
          <div className="h-px w-16 bg-outline-variant/30" />
          <p className="max-w-sm font-medium italic text-on-surface-variant">
            "Language is the roadmap of a culture. It tells you where its people
            come from and where they are going."
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleStartReview}
              className="rounded-full bg-primary px-8 py-4 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-primary/20"
            >
              Start Study Hub
            </button>
            <Link
              to={TopicRoutes.list()}
              className="rounded-full border border-outline-variant/30 bg-white px-8 py-4 font-bold text-on-surface transition-all hover:bg-surface-container-low"
            >
              View Mastery Map
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
