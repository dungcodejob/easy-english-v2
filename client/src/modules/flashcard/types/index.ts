// Flashcard Types
export interface FlashcardResponse {
  id: string;
  front: string;
  back: string;
  hint?: string;
  notes?: string;
  source: 'dictionary' | 'custom';
  wordSenseId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlashcardRequest {
  front: string;
  back: string;
  source: 'dictionary' | 'custom';
  hint?: string;
  notes?: string;
  wordSenseId?: string;
}

export interface UpdateFlashcardRequest {
  front?: string;
  back?: string;
  hint?: string;
  notes?: string;
}

export interface StudyStatsResponse {
  streak: number;
  totalCardsReviewed: number;
  totalStudyTimeMinutes: number;
  masteredCards: number;
  lastStudyDate?: string;
}

export interface DueCard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  source: 'learning-list' | 'custom';
  masteryLevel: number;
}
