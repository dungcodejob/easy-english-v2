import { ArgumentInvalidException } from '@core/exceptions';

import { ReviewRating } from '../review-rating.vo';

describe('ReviewRating', () => {
  describe('Again', () => {
    it('should have value 1', () => {
      expect(ReviewRating.Again.value).toBe(1);
    });

    it('should return the same instance for multiple calls', () => {
      const r1 = ReviewRating.Again;
      const r2 = ReviewRating.Again;

      expect(r1).toBe(r2);
    });
  });

  describe('Hard', () => {
    it('should have value 2', () => {
      expect(ReviewRating.Hard.value).toBe(2);
    });
  });

  describe('Good', () => {
    it('should have value 3', () => {
      expect(ReviewRating.Good.value).toBe(3);
    });
  });

  describe('Easy', () => {
    it('should have value 4', () => {
      expect(ReviewRating.Easy.value).toBe(4);
    });
  });

  describe('from', () => {
    it('should create Again from 1', () => {
      const rating = ReviewRating.from(1);

      expect(rating.value).toBe(1);
    });

    it('should create Hard from 2', () => {
      const rating = ReviewRating.from(2);

      expect(rating.value).toBe(2);
    });

    it('should create Good from 3', () => {
      const rating = ReviewRating.from(3);

      expect(rating.value).toBe(3);
    });

    it('should create Easy from 4', () => {
      const rating = ReviewRating.from(4);

      expect(rating.value).toBe(4);
    });

    it('should throw ArgumentInvalidException for 0', () => {
      expect(() => ReviewRating.from(0)).toThrow(ArgumentInvalidException);
    });

    it('should throw ArgumentInvalidException for 5', () => {
      expect(() => ReviewRating.from(5)).toThrow(ArgumentInvalidException);
    });

    it('should throw ArgumentInvalidException for negative numbers', () => {
      expect(() => ReviewRating.from(-1)).toThrow(ArgumentInvalidException);
    });
  });

  describe('isAgain', () => {
    it('should return true for Again', () => {
      expect(ReviewRating.Again.isAgain()).toBe(true);
    });

    it('should return false for other ratings', () => {
      expect(ReviewRating.Hard.isAgain()).toBe(false);
      expect(ReviewRating.Good.isAgain()).toBe(false);
      expect(ReviewRating.Easy.isAgain()).toBe(false);
    });
  });

  describe('equals', () => {
    it('should be equal when values match', () => {
      const r1 = ReviewRating.from(1);
      const r2 = ReviewRating.from(1);

      expect(r1.equals(r2)).toBe(true);
    });

    it('should not be equal when values differ', () => {
      const r1 = ReviewRating.from(1);
      const r2 = ReviewRating.from(3);

      expect(r1.equals(r2)).toBe(false);
    });
  });
});
