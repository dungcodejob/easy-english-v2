// Study session types for Phase 1 + Phase 2 (session tracking)

// ---------------------------------------------------------------------------
// Rating constants
// ---------------------------------------------------------------------------

export const Rating = {
  Again: 1,
  Hard: 2,
  Good: 3,
  Easy: 4,
} as const;

export type RatingValue = (typeof Rating)[keyof typeof Rating];

// ---------------------------------------------------------------------------
// Phase 1 — cards & review
// ---------------------------------------------------------------------------

export interface FlashcardStudyCard {
  wordSenseId: string;
  front: string;
  back: {
    definition: string;
    example: string | null;
  };
  hint: string;
  dueDate: string | null;
  isDue: boolean;
  isMastered: boolean;
  masteryLevel: 0 | 1 | 2 | 3 | 4 | 5;
}

export interface StudyCardsEnvelope {
  cards: FlashcardStudyCard[];
  total: number;
  capped: boolean;
}

export interface TopicStudyCardsEnvelope extends StudyCardsEnvelope {
  topicId: string;
}

export interface ReviewPayload {
  wordSenseId: string;
  rating: RatingValue;
  reviewDurationMs: number;
}

export interface ReviewResult {
  wordSenseId: string;
  nextDueDate: string | null;
  intervalDays: number;
  isDue: boolean;
  isMastered: boolean;
}

export type SessionMode = 'due' | 'topic' | 'quiz';

// ---------------------------------------------------------------------------
// Phase 2 — session tracking
// ---------------------------------------------------------------------------

export type StudyScope = 'DUE' | 'TOPIC';

export type StudyType = 'FLASHCARD' | 'QUIZ';

export interface StartSessionPayload {
  scope: StudyScope;
  topicId?: string;
  studyType?: StudyType;
}

export interface StartSessionResponse {
  sessionId: string;
  cards: FlashcardStudyCard[] | QuizCard[];
  total: number;
  capped: boolean;
}

export interface SessionReviewPayload {
  sessionId: string;
  wordSenseId: string;
  rating: RatingValue;
  reviewDurationMs: number;
}

export interface CompleteSessionResponse {
  sessionId: string;
  status: 'COMPLETED';
  completedAt: string;
}

export interface RatingBreakdown {
  again: number;
  hard: number;
  good: number;
  easy: number;
}

export interface SessionSummary {
  sessionId: string;
  scope: 'DUE' | 'TOPIC';
  studyType: string;
  topicId: string | null;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  reviewedCount: number;
  enrolledCount: number;
  ratingBreakdown: RatingBreakdown;
  accuracy: number;
  timeSpentMs: number;
  startedAt: string;
  completedAt: string | null;
}

// ---------------------------------------------------------------------------
// Phase 3 — Quiz Mode
// ---------------------------------------------------------------------------

export interface QuizOption {
  label: 'A' | 'B' | 'C' | 'D';
  text: string; // "everywhere — present or found everywhere"
}

export interface QuizCard {
  wordSenseId: string;
  word: string;
  partOfSpeech: string;
  question: string;
  options: QuizOption[]; // always 4 entries, shuffled
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

// Unified card type (flashcard or quiz)
export type StudyCard = FlashcardStudyCard | QuizCard;

export interface QuizAnswer {
  wordSenseId: string;
  selectedLabel: 'A' | 'B' | 'C' | 'D';
  correct: boolean;
  rating: RatingValue; // 3 = correct, 1 = wrong
}
