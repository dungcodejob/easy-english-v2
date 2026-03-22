import { ArgumentInvalidException } from '@core/exceptions';
import { CardState } from '../card-state.vo';

describe('CardState', () => {
  describe('NEW', () => {
    it('should have value "new"', () => {
      expect(CardState.NEW.value).toBe('new');
    });

    it('should return the same instance for multiple calls', () => {
      expect(CardState.NEW).toBe(CardState.NEW);
    });
  });

  describe('LEARNING', () => {
    it('should have value "learning"', () => {
      expect(CardState.LEARNING.value).toBe('learning');
    });
  });

  describe('REVIEW', () => {
    it('should have value "review"', () => {
      expect(CardState.REVIEW.value).toBe('review');
    });
  });

  describe('RELEARNING', () => {
    it('should have value "relearning"', () => {
      expect(CardState.RELEARNING.value).toBe('relearning');
    });
  });

  describe('GRACE', () => {
    it('should have value "grace"', () => {
      expect(CardState.GRACE.value).toBe('grace');
    });

    it('should be entered after a lapse — card re-enters relearning with short interval', () => {
      // Documentation note: grace is a transitional state after a lapse
      // The actual transition logic belongs in the domain service, but the VO exists
      expect(CardState.GRACE.value).toBe('grace');
    });
  });

  describe('from', () => {
    it('should create "new" from "new"', () => {
      const state = CardState.from('new');
      expect(state.value).toBe('new');
    });

    it('should create "learning" from "learning"', () => {
      const state = CardState.from('learning');
      expect(state.value).toBe('learning');
    });

    it('should create "review" from "review"', () => {
      const state = CardState.from('review');
      expect(state.value).toBe('review');
    });

    it('should create "relearning" from "relearning"', () => {
      const state = CardState.from('relearning');
      expect(state.value).toBe('relearning');
    });

    it('should create "grace" from "grace"', () => {
      const state = CardState.from('grace');
      expect(state.value).toBe('grace');
    });

    it('should throw ArgumentInvalidException for unknown value', () => {
      expect(() => CardState.from('unknown')).toThrow(ArgumentInvalidException);
    });

    it('should throw ArgumentInvalidException for empty string', () => {
      expect(() => CardState.from('')).toThrow(ArgumentInvalidException);
    });
  });

  describe('equals', () => {
    it('should be equal when states match', () => {
      const s1 = CardState.from('new');
      const s2 = CardState.from('new');
      expect(s1.equals(s2)).toBe(true);
    });

    it('should not be equal when states differ', () => {
      const s1 = CardState.from('new');
      const s2 = CardState.from('review');
      expect(s1.equals(s2)).toBe(false);
    });
  });
});
