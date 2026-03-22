import { ArgumentInvalidException } from '@core/exceptions';
import { FlashcardSource } from '../flashcard-source.vo';

describe('FlashcardSource', () => {
  describe('dictionary', () => {
    it('should return a FlashcardSource with value "dictionary"', () => {
      expect(FlashcardSource.dictionary.value).toBe('dictionary');
    });

    it('should return the same instance for multiple calls', () => {
      expect(FlashcardSource.dictionary).toBe(FlashcardSource.dictionary);
    });
  });

  describe('custom', () => {
    it('should return a FlashcardSource with value "custom"', () => {
      expect(FlashcardSource.custom.value).toBe('custom');
    });

    it('should return the same instance for multiple calls', () => {
      expect(FlashcardSource.custom).toBe(FlashcardSource.custom);
    });
  });

  describe('from', () => {
    it('should create dictionary source from "dictionary" string', () => {
      const source = FlashcardSource.from('dictionary');
      expect(source.value).toBe('dictionary');
    });

    it('should create custom source from "custom" string', () => {
      const source = FlashcardSource.from('custom');
      expect(source.value).toBe('custom');
    });

    it('should throw ArgumentInvalidException for unknown value', () => {
      expect(() => FlashcardSource.from('unknown')).toThrow(
        ArgumentInvalidException,
      );
    });

    it('should throw ArgumentInvalidException for empty string', () => {
      expect(() => FlashcardSource.from('')).toThrow(
        ArgumentInvalidException,
      );
    });
  });

  describe('equals', () => {
    it('should be equal when sources match', () => {
      const source1 = FlashcardSource.dictionary;
      const source2 = FlashcardSource.dictionary;
      expect(source1.equals(source2)).toBe(true);
    });

    it('should not be equal when sources differ', () => {
      const source1 = FlashcardSource.dictionary;
      const source2 = FlashcardSource.custom;
      expect(source1.equals(source2)).toBe(false);
    });
  });
});
