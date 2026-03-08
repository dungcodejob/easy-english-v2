// Shared types for the Learning module

export interface WordSenseLearningState {
  isLearning: boolean;
  masteryLevel: number;
  reviewCount: number;
  nextReviewAt: string;
}

export interface LearningListItem {
  id: string;
  senseId: string;
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

export interface WordSenseSearchResult {
  senseId: string;
  wordText: string;
  normalizedText: string;
  partOfSpeech: string;
  shortDefinition: string | null;
  cefrLevel: string | null;
}
