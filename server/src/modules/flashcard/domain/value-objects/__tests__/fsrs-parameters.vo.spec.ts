import { CardState } from '../../../../learning/progress/domain/value-objects/card-state.vo';
import { FsrsParameters } from '../../../../learning/progress/domain/value-objects/fsrs-parameters.vo';

describe('FsrsParameters', () => {
  describe('constructor and getters', () => {
    it('should store all props correctly', () => {
      const props: FsrsParametersProps = {
        stability: 10,
        difficulty: 3,
        lapses: 0,
        reps: 5,
        state: CardState.REVIEW,
        dueDate: new Date('2025-01-01'),
        lastReviewDate: new Date('2024-12-31'),
      };
      const params = new FsrsParameters(props);

      expect(params.stability).toBe(10);
      expect(params.difficulty).toBe(3);
      expect(params.lapses).toBe(0);
      expect(params.reps).toBe(5);
      expect(params.state.equals(CardState.REVIEW)).toBe(true);
      expect(params.dueDate).toEqual(new Date('2025-01-01'));
      expect(params.lastReviewDate).toEqual(new Date('2024-12-31'));
    });
  });

  describe('isMastered', () => {
    it('should return true when stability >= 30 AND lapses === 0', () => {
      const props: FsrsParametersProps = {
        stability: 30,
        difficulty: 1,
        lapses: 0,
        reps: 100,
        state: CardState.REVIEW,
        dueDate: new Date(),
        lastReviewDate: new Date(),
      };
      const params = new FsrsParameters(props);
      expect(params.isMastered).toBe(true);
    });

    it('should return true when stability > 30 AND lapses === 0', () => {
      const props: FsrsParametersProps = {
        stability: 100,
        difficulty: 2,
        lapses: 0,
        reps: 200,
        state: CardState.REVIEW,
        dueDate: new Date(),
        lastReviewDate: new Date(),
      };
      const params = new FsrsParameters(props);
      expect(params.isMastered).toBe(true);
    });

    it('should return false when stability < 30', () => {
      const props: FsrsParametersProps = {
        stability: 29,
        difficulty: 1,
        lapses: 0,
        reps: 10,
        state: CardState.REVIEW,
        dueDate: new Date(),
        lastReviewDate: new Date(),
      };
      const params = new FsrsParameters(props);
      expect(params.isMastered).toBe(false);
    });

    it('should return false when stability >= 30 but lapses > 0', () => {
      const props: FsrsParametersProps = {
        stability: 50,
        difficulty: 4,
        lapses: 1,
        reps: 50,
        state: CardState.RELEARNING,
        dueDate: new Date(),
        lastReviewDate: new Date(),
      };
      const params = new FsrsParameters(props);
      expect(params.isMastered).toBe(false);
    });

    it('should return false when both conditions are false', () => {
      const props: FsrsParametersProps = {
        stability: 5,
        difficulty: 5,
        lapses: 3,
        reps: 3,
        state: CardState.GRACE,
        dueDate: new Date(),
        lastReviewDate: new Date(),
      };
      const params = new FsrsParameters(props);
      expect(params.isMastered).toBe(false);
    });
  });

  describe('newCardDefaults', () => {
    it('should create default params for a new card', () => {
      const params = FsrsParameters.newCardDefaults();

      expect(params.stability).toBe(0);
      expect(params.difficulty).toBe(0);
      expect(params.lapses).toBe(0);
      expect(params.reps).toBe(0);
      expect(params.state.equals(CardState.NEW)).toBe(true);
      expect(params.dueDate).toBeNull();
      expect(params.lastReviewDate).toBeNull();
    });
  });

  describe('equals', () => {
    it('should be equal when all props match', () => {
      const dueDate = new Date('2025-01-01');
      const lastReview = new Date('2024-12-31');
      const props1: FsrsParametersProps = {
        stability: 10,
        difficulty: 3,
        lapses: 0,
        reps: 5,
        state: CardState.REVIEW,
        dueDate,
        lastReviewDate: lastReview,
      };
      const props2: FsrsParametersProps = {
        stability: 10,
        difficulty: 3,
        lapses: 0,
        reps: 5,
        state: CardState.REVIEW,
        dueDate,
        lastReviewDate: lastReview,
      };
      const p1 = new FsrsParameters(props1);
      const p2 = new FsrsParameters(props2);
      expect(p1.equals(p2)).toBe(true);
    });

    it('should not be equal when stability differs', () => {
      const props1: FsrsParametersProps = {
        stability: 10,
        difficulty: 3,
        lapses: 0,
        reps: 5,
        state: CardState.REVIEW,
        dueDate: new Date(),
        lastReviewDate: new Date(),
      };
      const props2: FsrsParametersProps = {
        stability: 20,
        difficulty: 3,
        lapses: 0,
        reps: 5,
        state: CardState.REVIEW,
        dueDate: new Date(),
        lastReviewDate: new Date(),
      };
      const p1 = new FsrsParameters(props1);
      const p2 = new FsrsParameters(props2);
      expect(p1.equals(p2)).toBe(false);
    });

    it('should not be equal when state differs', () => {
      const props1: FsrsParametersProps = {
        stability: 10,
        difficulty: 3,
        lapses: 0,
        reps: 5,
        state: CardState.REVIEW,
        dueDate: new Date(),
        lastReviewDate: new Date(),
      };
      const props2: FsrsParametersProps = {
        stability: 10,
        difficulty: 3,
        lapses: 0,
        reps: 5,
        state: CardState.RELEARNING,
        dueDate: new Date(),
        lastReviewDate: new Date(),
      };
      const p1 = new FsrsParameters(props1);
      const p2 = new FsrsParameters(props2);
      expect(p1.equals(p2)).toBe(false);
    });
  });
});
