import { create } from 'zustand';
import type { StudyCard, SessionMode } from '../types/study.types';

interface StudySessionStore {
  // State
  cards: StudyCard[];
  currentIndex: number;
  flipped: boolean;
  sessionMode: SessionMode | null;
  topicId: string | null;
  reviewedCount: number;
  correctLikeCount: number;
  startedAt: number | null;
  elapsedMs: number;
  isSubmittingRating: boolean;

  // Actions
  startSession: (
    cards: StudyCard[],
    mode: SessionMode,
    topicId?: string,
  ) => void;
  setIndex: (index: number) => void;
  flipCard: () => void;
  setSubmittingRating: (value: boolean) => void;
  recordRating: (rating: 1 | 2 | 3 | 4) => void;
  goNext: () => void;
  finishSession: () => void;
  resetSession: () => void;
}

export const useStudySessionStore = create<StudySessionStore>((set, get) => ({
  cards: [],
  currentIndex: 0,
  flipped: false,
  sessionMode: null,
  topicId: null,
  reviewedCount: 0,
  correctLikeCount: 0,
  startedAt: null,
  elapsedMs: 0,
  isSubmittingRating: false,

  startSession: (cards, mode, topicId) =>
    set({
      cards,
      currentIndex: 0,
      flipped: false,
      sessionMode: mode,
      topicId: topicId ?? null,
      reviewedCount: 0,
      correctLikeCount: 0,
      startedAt: Date.now(),
      elapsedMs: 0,
      isSubmittingRating: false,
    }),

  setIndex: (index) =>
    set({ currentIndex: index, flipped: false }),

  flipCard: () =>
    set((state) => ({ flipped: !state.flipped })),

  setSubmittingRating: (value) =>
    set({ isSubmittingRating: value }),

  recordRating: (rating) =>
    set((state) => ({
      reviewedCount: state.reviewedCount + 1,
      correctLikeCount:
        rating >= 3 ? state.correctLikeCount + 1 : state.correctLikeCount,
    })),

  goNext: () => {
    const { cards, currentIndex } = get();
    const nextIndex = currentIndex + 1;
    if (nextIndex >= cards.length) {
      set({ currentIndex: cards.length, flipped: false });
    } else {
      set({ currentIndex: nextIndex, flipped: false });
    }
  },

  finishSession: () =>
    set({
      currentIndex: get().cards.length,
      elapsedMs: get().startedAt ? Date.now() - get().startedAt : 0,
      isSubmittingRating: false,
    }),

  resetSession: () =>
    set({
      cards: [],
      currentIndex: 0,
      flipped: false,
      sessionMode: null,
      topicId: null,
      reviewedCount: 0,
      correctLikeCount: 0,
      startedAt: null,
      elapsedMs: 0,
      isSubmittingRating: false,
    }),
}));
