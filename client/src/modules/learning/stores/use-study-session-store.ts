import { create } from 'zustand';
import type { RatingBreakdown, SessionMode, StudyCard } from '../types/study.types';

interface StudySessionStore {
  // Phase 1 fields
  cards: StudyCard[];
  currentIndex: number;
  flipped: boolean;
  sessionMode: SessionMode | null;
  topicId: string | null;
  startedAt: number | null;
  elapsedMs: number;
  isSubmittingRating: boolean;

  // Phase 2 fields
  sessionId: string | null;
  completed: boolean;
  ratingBreakdown: RatingBreakdown;
  reviewedCount: number;

  // Derived — not stored, computed from ratingBreakdown
  // correctLikeCount = ratingBreakdown.good + ratingBreakdown.easy

  // Actions
  startSession: (
    cards: StudyCard[],
    mode: SessionMode,
    sessionId: string,
    topicId?: string,
  ) => void;
  setSessionCompleted: () => void;
  setIndex: (index: number) => void;
  flipCard: () => void;
  setSubmittingRating: (value: boolean) => void;
  recordRating: (rating: 1 | 2 | 3 | 4) => void;
  goNext: () => void;
  finishSession: () => void;
  resetSession: () => void;
}

export const useStudySessionStore = create<StudySessionStore>((set, get) => ({
  // Phase 1 fields
  cards: [],
  currentIndex: 0,
  flipped: false,
  sessionMode: null,
  topicId: null,
  startedAt: null,
  elapsedMs: 0,
  isSubmittingRating: false,

  // Phase 2 fields
  sessionId: null,
  completed: false,
  ratingBreakdown: { again: 0, hard: 0, good: 0, easy: 0 },
  reviewedCount: 0,

  startSession: (cards, mode, sessionId, topicId) =>
    set({
      cards,
      currentIndex: 0,
      flipped: false,
      sessionMode: mode,
      topicId: topicId ?? null,
      sessionId,
      completed: false,
      ratingBreakdown: { again: 0, hard: 0, good: 0, easy: 0 },
      reviewedCount: 0,
      startedAt: Date.now(),
      elapsedMs: 0,
      isSubmittingRating: false,
    }),

  setSessionCompleted: () =>
    set({
      completed: true,
      elapsedMs: get().startedAt ? Date.now() - get().startedAt : 0,
      isSubmittingRating: false,
    }),

  setIndex: (index) =>
    set({ currentIndex: index, flipped: false }),

  flipCard: () =>
    set((state) => ({ flipped: !state.flipped })),

  setSubmittingRating: (value) =>
    set({ isSubmittingRating: value }),

  recordRating: (rating: 1 | 2 | 3 | 4) =>
    set((state) => {
      const breakdown = { ...state.ratingBreakdown };
      if (rating === 1) breakdown.again += 1;
      else if (rating === 2) breakdown.hard += 1;
      else if (rating === 3) breakdown.good += 1;
      else if (rating === 4) breakdown.easy += 1;
      return { ratingBreakdown: breakdown, reviewedCount: state.reviewedCount + 1 };
    }),

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
      sessionId: null,
      completed: false,
      ratingBreakdown: { again: 0, hard: 0, good: 0, easy: 0 },
      reviewedCount: 0,
      startedAt: null,
      elapsedMs: 0,
      isSubmittingRating: false,
    }),
}));
