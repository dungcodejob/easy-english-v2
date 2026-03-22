/**
 * StatsPage — Flashcard module
 *
 * UI: 100% delegated to Design System components.
 * Business logic: unchanged.
 */

import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  BookOpen,
  Calendar,
  Clock,
  Flame,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';

import { DsCard, DsProgress } from '@/shared/ui';
import { useStudyStats, useFlashcards } from '../hooks/use-flashcards';

export const Route = createFileRoute('/_(authenticated)/flashcards/stats')({
  component: StatsPage,
});

function StatsPage() {
  const { t } = useTranslation();
  const { data: statsData, isLoading: statsLoading } = useStudyStats();
  const { data: flashcardsData } = useFlashcards();

  const stats = statsData?.data;
  const totalCards = flashcardsData?.data?.length ?? 0;

  if (statsLoading || !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg
          className="size-8 animate-spin text-muted-foreground"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  const statCards = [
    {
      title: t('stats.streak') || 'Current Streak',
      value: `${stats.streak}`,
      unit: 'days',
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      description: t('stats.streak_desc') || 'Keep it going!',
    },
    {
      title: t('stats.cards_reviewed') || 'Cards Reviewed',
      value: `${stats.totalCardsReviewed}`,
      unit: '',
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      description: t('stats.cards_reviewed_desc') || 'Total cards reviewed',
    },
    {
      title: t('stats.study_time') || 'Study Time',
      value: `${stats.totalStudyTimeMinutes}`,
      unit: 'min',
      icon: Clock,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      description: t('stats.study_time_desc') || 'Total time spent studying',
    },
    {
      title: t('stats.mastered') || 'Mastered Cards',
      value: `${stats.masteredCards}`,
      unit: '',
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      description: t('stats.mastered_desc') || "Cards you've mastered",
    },
  ];

  const lastStudyDate = stats.lastStudyDate
    ? new Date(stats.lastStudyDate).toLocaleDateString()
    : t('stats.never') || 'Never';

  const masteryProgress =
    totalCards > 0 ? (stats.masteredCards / totalCards) * 100 : 0;

  return (
    <div className="flex w-full max-w-4xl flex-col gap-6 pb-10 mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('stats.title') || 'Study Statistics'}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t('stats.subtitle') || 'Track your learning progress'}
        </p>
      </div>

      {/* Hero Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard
              title={stat.title}
              value={stat.value}
              unit={stat.unit}
              icon={stat.icon}
              color={stat.color}
              bgColor={stat.bgColor}
              description={stat.description}
            />
          </motion.div>
        ))}
      </div>

      {/* Mastery Progress */}
      <DsCard className="overflow-hidden">
        <DsCard.Header className="gap-2">
          <Target className="size-5 text-primary" />
          <span className="text-sm font-medium">
            {t('stats.mastery_progress') || 'Mastery Progress'}
          </span>
        </DsCard.Header>
        <DsCard.Content className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t('stats.overall_mastery') || 'Overall Mastery'}
              </span>
              <span className="font-medium">{Math.round(masteryProgress)}%</span>
            </div>
            <DsProgress value={masteryProgress} size="lg" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">{totalCards}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {t('stats.total_cards') || 'Total Cards'}
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <div className="text-2xl font-bold text-green-500">
                {stats.masteredCards}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {t('stats.mastered') || 'Mastered'}
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">{stats.streak}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {t('stats.day_streak') || 'Day Streak'}
              </div>
            </div>
          </div>
        </DsCard.Content>
      </DsCard>

      {/* Activity Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <ActivityCard
          icon={<Calendar className="size-5 text-muted-foreground" />}
          title={t('stats.last_study') || 'Last Study Session'}
          value={lastStudyDate}
          description={
            stats.lastStudyDate
              ? t('stats.keep_going') || 'Keep up the great work!'
              : t('stats.start_studying') || 'Start studying to build your streak!'
          }
        />
        <ActivityCard
          icon={<Zap className="size-5 text-muted-foreground" />}
          title={t('stats.this_week') || 'This Week'}
          value={`${stats.totalCardsReviewed}`}
          description={
            t('stats.cards_this_week') || 'cards reviewed'
          }
        />
      </div>
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────────── */

function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  color,
  bgColor,
  description,
}: {
  title: string;
  value: string;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  description: string;
}) {
  return (
    <DsCard className="hover:-translate-y-1 hover:shadow-md transition-all duration-200">
      <DsCard.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className={`rounded-full p-2 ${bgColor}`}>
          <Icon className={`size-4 ${color}`} />
        </div>
      </DsCard.Header>
      <DsCard.Content>
        <div className="text-3xl font-bold">
          {value}
          {unit && (
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              {unit}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </DsCard.Content>
    </DsCard>
  );
}

function ActivityCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <DsCard>
      <DsCard.Header className="flex flex-row items-center gap-2">
        {icon}
        <span className="text-lg font-medium">{title}</span>
      </DsCard.Header>
      <DsCard.Content>
        <div className="text-2xl font-semibold">{value}</div>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </DsCard.Content>
    </DsCard>
  );
}
