export const RouteGroups = {
  authenticated: '(authenticated)',
  public: '(public)',
} as const;

export const AuthRoutes = {
  login: (redirect?: string) =>
    `/login${redirect ? `?redirect=${redirect}` : ''}`,
  register: () => '/register',
};

export const WorkspaceRoutes = {
  new: () => '/workspace/new',
  list: () => '/workspace',
  settings: () => '/workspace/settings',
};

export const TopicRoutes = {
  list: () => '/learning/topics',
  detail: (topicId: string) => `/learning/topics/${topicId}`,
};

export const DictionaryRoutes = {
  search: () => '/dictionary',
  senseDetail: (senseId: string) => `/dictionary/senses/${senseId}`,
};

export const LearnRoutes = {
  base: () => '/learning',
  study: () => '/learning/study',
};

export const FlashcardsRoutes = {
  list: () => '/flashcards',
  study: () => '/flashcards/study',
  stats: () => '/flashcards/stats',
};

export const ReviewRoutes = {
  list: () => '/review',
};

export const ProgressRoutes = {
  list: () => '/progress',
};

export const AchievementsRoutes = {
  list: () => '/achievements',
};

export const SettingsRoutes = {
  list: () => '/settings',
  profile: () => '/settings/profile',
};

export const DashboardRoutes = {
  list: () => '/dashboard',
};

export const AppRoutes = {
  root: () => '/',
  auth: AuthRoutes,
  workspace: WorkspaceRoutes,
  topic: TopicRoutes,
  dictionary: DictionaryRoutes,
  learn: LearnRoutes,
  flashcards: FlashcardsRoutes,
  review: ReviewRoutes,
  progress: ProgressRoutes,
  achievements: AchievementsRoutes,
  settings: SettingsRoutes,
};
