import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  Flame,
  BookOpen,
  Clock,
  Trophy,
  TrendingUp,
  Calendar,
  Target,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/card';
import { Progress } from '@/shared/ui/shadcn/progress';
import { useStudyStats, useFlashcards } from '../hooks/use-flashcards';
import { Spinner } from '@/shared/ui/shadcn/spinner';

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
        <Spinner className="size-8" />
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
      description: t('stats.mastered_desc') || 'Cards you\'ve mastered',
    },
  ];

  const lastStudyDate = stats.lastStudyDate
    ? new Date(stats.lastStudyDate).toLocaleDateString()
    : t('stats.never') || 'Never';

  const masteryProgress = totalCards > 0 ? (stats.masteredCards / totalCards) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('stats.title') || 'Study Statistics'}
        </h1>
        <p className="text-muted-foreground mt-1">
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
            <Card className="hover:-translate-y-1 hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`size-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stat.value}
                  {stat.unit && (
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {stat.unit}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Mastery Progress */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="size-5 text-primary" />
            {t('stats.mastery_progress') || 'Mastery Progress'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t('stats.overall_mastery') || 'Overall Mastery'}
              </span>
              <span className="font-medium">{Math.round(masteryProgress)}%</span>
            </div>
            <Progress value={masteryProgress} className="h-3" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-blue-500">{totalCards}</div>
              <div className="text-sm text-muted-foreground">
                {t('stats.total_cards') || 'Total Cards'}
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-green-500">{stats.masteredCards}</div>
              <div className="text-sm text-muted-foreground">
                {t('stats.mastered') || 'Mastered'}
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-orange-500">{stats.streak}</div>
              <div className="text-sm text-muted-foreground">
                {t('stats.day_streak') || 'Day Streak'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Calendar className="size-5 text-muted-foreground" />
            <CardTitle className="text-lg">
              {t('stats.last_study') || 'Last Study Session'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{lastStudyDate}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.lastStudyDate
                ? t('stats.keep_going') || 'Keep up the great work!'
                : t('stats.start_studying') || 'Start studying to build your streak!'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Zap className="size-5 text-muted-foreground" />
            <CardTitle className="text-lg">
              {t('stats.this_week') || 'This Week'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {stats.totalCardsReviewed}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {t('stats.cards_this_week') || 'cards reviewed'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
