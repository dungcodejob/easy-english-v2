import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Rating } from '../types/study.types';
import type {
  QuizAnswer,
  QuizCard,
  RatingBreakdown,
  RatingValue,
  SessionMode,
  StudyCard,
} from '../types/study.types';

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

  // Phase 3 — Quiz Mode
  quizAnswers: QuizAnswer[];
  recordQuizAnswer: (answer: QuizAnswer) => void;
  getQuizScore: () => { correct: number; total: number; accuracy: number };

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
  recordRating: (rating: RatingValue) => void;
  goNext: () => void;
  finishSession: () => void;
  resetSession: () => void;
}

export const useStudySessionStore = create<StudySessionStore>()(
  persist(
    (set, get) => ({
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

      // Phase 3 — Quiz Mode
      quizAnswers: [],

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
          quizAnswers: [],
        }),

      setSessionCompleted: () =>
        set({
          completed: true,
          elapsedMs: get().startedAt ? Date.now() - get().startedAt : 0,
          isSubmittingRating: false,
        }),

      setIndex: (index) => set({ currentIndex: index, flipped: false }),

      flipCard: () => set((state) => ({ flipped: !state.flipped })),

      setSubmittingRating: (value) => set({ isSubmittingRating: value }),

      recordRating: (rating: RatingValue) =>
        set((state) => {
          const breakdown = { ...state.ratingBreakdown };
          if (rating === Rating.Again) breakdown.again += 1;
          else if (rating === Rating.Hard) breakdown.hard += 1;
          else if (rating === Rating.Good) breakdown.good += 1;
          else if (rating === Rating.Easy) breakdown.easy += 1;
          return {
            ratingBreakdown: breakdown,
            reviewedCount: state.reviewedCount + 1,
          };
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

      // Phase 3 — Quiz Mode
      recordQuizAnswer: (answer) =>
        set((s) => ({ quizAnswers: [...s.quizAnswers, answer] })),

      getQuizScore: () => {
        const { quizAnswers } = get();
        const correct = quizAnswers.filter((a) => a.correct).length;
        return {
          correct,
          total: quizAnswers.length,
          accuracy: quizAnswers.length > 0 ? correct / quizAnswers.length : 0,
        };
      },

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
          quizAnswers: [],
        }),
    }),
    {
      name: 'study-session-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        cards: state.cards,
        currentIndex: state.currentIndex,
        sessionId: state.sessionId,
        sessionMode: state.sessionMode,
        topicId: state.topicId,
        startedAt: state.startedAt,
        ratingBreakdown: state.ratingBreakdown,
        reviewedCount: state.reviewedCount,
        quizAnswers: state.quizAnswers,
        completed: state.completed,
      }),
    },
  ),
);
