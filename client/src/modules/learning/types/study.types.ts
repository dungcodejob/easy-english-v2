// Study session types for Phase 1

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
