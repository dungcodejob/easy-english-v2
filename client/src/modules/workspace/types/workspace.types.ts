export enum WorkspaceType {
  PERSONAL = 'PERSONAL',
  TEAM = 'TEAM',
  CLASSROOM = 'CLASSROOM',
}

export enum Language {
  EN = 'EN',
  VI = 'VI',
  ES = 'ES',
  FR = 'FR',
  DE = 'DE',
  JA = 'JA',
  KO = 'KO',
  ZH = 'ZH',
}

export enum LearningGoal {
  VOCABULARY = 'VOCABULARY',
  EXAM_PREP = 'EXAM_PREP',
  DAILY_PRACTICE = 'DAILY_PRACTICE',
}

export enum Level {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum LearningMode {
  FLASHCARD = 'FLASHCARD',
  QUIZ = 'QUIZ',
  SPACED_REPETITION = 'SPACED_REPETITION',
}

export interface Workspace {
  id: string;
  tenantId: string;
  userId: string;
  name: string;
  description?: string;
  type: WorkspaceType;
  language: Language;
  learningGoal: LearningGoal;
  level: Level;
  dailyTarget: number;
  studyReminder: boolean;
  defaultLearningMode: LearningMode;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  type: WorkspaceType;
  language: Language;
  learningGoal: LearningGoal;
  level: Level;
  dailyTarget: number;
  studyReminder: boolean;
  defaultLearningMode: LearningMode;
}

export interface CheckHasWorkspaceResponse {
  hasWorkspace: boolean;
  count: number;
}
