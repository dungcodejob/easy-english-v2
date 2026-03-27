// Study session types for Phase 1 + Phase 2 (session tracking)

// ---------------------------------------------------------------------------
// Phase 1 — cards & review
// ---------------------------------------------------------------------------

export interface StudyCard {
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
  cards: StudyCard[];
  total: number;
  capped: boolean;
}

export interface TopicStudyCardsEnvelope extends StudyCardsEnvelope {
  topicId: string;
}

export interface ReviewPayload {
  wordSenseId: string;
  rating: 1 | 2 | 3 | 4;
  reviewDurationMs: number;
}

export interface ReviewResult {
  wordSenseId: string;
  nextDueDate: string | null;
  intervalDays: number;
  isDue: boolean;
  isMastered: boolean;
}

export type SessionMode = 'due' | 'topic';

// ---------------------------------------------------------------------------
// Phase 2 — session tracking
// ---------------------------------------------------------------------------

export type StudyScope = 'DUE' | 'TOPIC';

export interface StartSessionPayload {
  scope: StudyScope;
  topicId?: string;
}

export interface StartSessionResponse {
  sessionId: string;
  cards: StudyCard[];
  total: number;
  capped: boolean;
}

export interface SessionReviewPayload {
  sessionId: string;
  wordSenseId: string;
  rating: 1 | 2 | 3 | 4;
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
