import { ArgumentNotProvidedException } from '@core/exceptions';
import { FlashcardId } from '../flashcard-id.vo';

describe('FlashcardId', () => {
  describe('generate', () => {
    it('should create a FlashcardId with a v7 UUID', () => {
      const id = FlashcardId.generate();
      expect(id.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should generate unique ids', () => {
      const id1 = FlashcardId.generate();
      const id2 = FlashcardId.generate();
      expect(id1.value).not.toBe(id2.value);
    });
  });

  describe('from', () => {
    it('should create a FlashcardId from a valid UUID string', () => {
      const uuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      const id = FlashcardId.from(uuid);
      expect(id.value).toBe(uuid);
    });

    it('should throw ArgumentNotProvidedException for empty string', () => {
      expect(() => FlashcardId.from('')).toThrow(ArgumentNotProvidedException);
    });

    it('should throw ArgumentNotProvidedException for whitespace-only string', () => {
      expect(() => FlashcardId.from('   ')).toThrow(ArgumentNotProvidedException);
    });

    it('should accept any non-empty string as id (validation is up to the caller)', () => {
      // The VO only validates non-emptiness; UUID format can be enforced at the input layer
      const id = FlashcardId.from('any-string-id');
      expect(id.value).toBe('any-string-id');
    });
  });

  describe('equals', () => {
    it('should be equal when values match', () => {
      const id1 = FlashcardId.from('abc-123');
      const id2 = FlashcardId.from('abc-123');
      expect(id1.equals(id2)).toBe(true);
    });

    it('should not be equal when values differ', () => {
      const id1 = FlashcardId.from('abc-123');
      const id2 = FlashcardId.from('xyz-456');
      expect(id1.equals(id2)).toBe(false);
    });
  });
});
