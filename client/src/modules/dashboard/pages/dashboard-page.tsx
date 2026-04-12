import { Button } from '@/shared/ui/shadcn/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui/shadcn/card';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  ArrowRight,
  BookOpen,
  Clock,
  Flame,
  PlayCircle,
  Star,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';

export const Route = createFileRoute('/_(authenticated)/dashboard')({
  component: DashboardPage,
});

export default function DashboardPage() {
  const { t } = useTranslation();

  // Temporary mock data
  const stats = [
    {
      title: t('dashboard.stats.streak'),
      value: '12 Days',
      icon: Flame,
      trend: t('dashboard.stats.streak_trend', { count: 2 }),
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: t('dashboard.stats.words_learned'),
      value: '348',
      icon: BookOpen,
      trend: t('dashboard.stats.words_trend', { count: 24 }),
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: t('dashboard.stats.accuracy'),
      value: '92%',
      icon: Target,
      trend: t('dashboard.stats.accuracy_trend', { count: 1.2 }),
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  const recentTopics = [
    { title: 'Business Negotiations', progress: 80, time: '2h ago' },
    { title: 'Travel & Airport', progress: 100, time: 'Yesterday' },
    { title: 'Daily Conversations', progress: 45, time: '2 days ago' },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary/10 via-primary/5 to-background border border-primary/20 h-48 p-8 sm:p-10 shadow-sm transition-all">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <h1 className="font-headline text-5xl font-extrabold text-primary mb-4 tracking-tight">
            {t('dashboard.welcome', { name: 'Scholar' })}
          </h1>
          <p className="text-muted-foreground text-lg pb-2">
            <Trans
              i18nKey="dashboard.review_status"
              values={{ count: 15 }}
              components={[
                <strong key="0" className="text-primary font-semibold" />,
              ]}
            />
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="bg-gradient-to-br from-primary to-primary-container text-white rounded-full px-10 py-5 font-headline font-bold shadow-lg flex items-center gap-3"
              asChild
            >
              {/* TODO: Update routing once /review is registered */}
              <Link to="/">
                <PlayCircle className="size-5" />
                {t('dashboard.start_review')}
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <Link to="/learning">
                <BookOpen className="size-5" />
                {t('dashboard.explore_topic')}
              </Link>
            </Button>
          </div>
        </div>
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 sm:w-80 sm:h-80 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-32 sm:w-64 sm:h-64 bg-accent/20 rounded-full blur-3xl" />
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card
            key={i}
            className="rounded-2xl border border-outline-variant/20 bg-surface-container p-6 shadow-sm"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`size-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="size-3" />
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* 3. Daily Goal Progress */}
        <Card className="col-span-1 lg:col-span-1 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="size-5 text-primary" />{' '}
              {t('dashboard.daily_goal')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-xl">
              <div className="relative size-32">
                <svg
                  className="size-full -rotate-90"
                  viewBox="0 0 36 36"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-current text-muted stroke-2"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-current text-primary stroke-2"
                    strokeDasharray="100"
                    strokeDashoffset="40"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">60%</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    {t('dashboard.completed')}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-sm text-center text-muted-foreground">
                <Trans
                  i18nKey="dashboard.goal_progress"
                  values={{ count: 12, total: 20 }}
                  components={[<strong key="0" className="text-foreground" />]}
                />
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 4. Recent Topics */}
        <Card className="col-span-1 lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Star className="size-5 text-yellow-500 fill-yellow-500/20" />{' '}
              {t('dashboard.recent_topics')}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 h-8 text-muted-foreground"
              asChild
            >
              {/* TODO: Update routing once /topic is registered */}
              <Link to="/learning">
                {t('dashboard.view_all')} <ArrowRight className="size-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-2">
              {recentTopics.map((topic, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between group p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <BookOpen className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                        {topic.title}
                      </h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="size-3" /> {topic.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold">
                      {topic.progress}%
                    </span>
                    <div className="w-16 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className="h-full bg-tertiary-fixed-dim rounded-full shadow-[0_0_8px_rgba(255,185,84,0.4)]"
                        style={{ width: `${topic.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
