// Shared types for the Learning module

export interface WordSenseLearningState {
  isLearning: boolean;
  masteryLevel: number;
  reviewCount: number;
  nextReviewAt: string;
}

export interface LearningListItem {
  progressId: string;
  wordSenseId: string;
  wordText: string;
  partOfSpeech: string;
  shortDefinition: string | null;
  cefrLevel: string | null;
  masteryLevel: number;
  reviewCount: number;
  nextReviewAt: string;
  lastReviewedAt: string | null;
  addedAt: string;
}

export interface PaginatedLearningList {
  success: boolean;
  data: LearningListItem[];
  pagination: {
    top: number;
    skip: number;
    count: number;
    hasMore: boolean;
  };
}

export interface WordSenseSearchResult {
  senseId: string;
  wordText: string;
  normalizedText: string;
  partOfSpeech: string;
  shortDefinition: string | null;
  cefrLevel: string | null;
}

export interface PaginatedResult<T> {
  success: boolean;
  data: T[];
  pagination: {
    top: number;
    skip: number;
    count: number;
    hasMore: boolean;
  };
  meta: any;
}
