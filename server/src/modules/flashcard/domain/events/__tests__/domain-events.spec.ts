import { type Flashcard } from '../../entities/flashcard.aggregate';
import {
  FlashcardCreatedEvent,
  FlashcardDeletedEvent,
  FlashcardUpdatedEvent,
} from '../index';

describe('Flashcard Domain Events', () => {
  const aggregateId = 'flashcard-123';

  describe('FlashcardCreatedEvent', () => {
    it('should create event with aggregateId and flashcard data', () => {
      const flashcard = { id: aggregateId } as Partial<Flashcard>;
      const event = new FlashcardCreatedEvent({
        aggregateId,
        flashcard,
      });

      expect(event.aggregateId).toBe(aggregateId);
      expect(event.flashcard).toBe(flashcard);
      expect(event.id).toBeDefined();
      expect(event.metadata).toBeDefined();
      expect(event.metadata.timestamp).toBeDefined();
    });

    it('should accept metadata like correlationId', () => {
      const event = new FlashcardCreatedEvent({
        aggregateId,
        flashcard: {} as Partial<Flashcard>,
        metadata: {
          correlationId: 'corr-1',
          userId: 'user-1',
          causationId: 'causation-1',
          timestamp: new Date().getTime(),
        },
      });

      expect(event.metadata.correlationId).toBe('corr-1');
      expect(event.metadata.userId).toBe('user-1');
    });
  });

  describe('FlashcardUpdatedEvent', () => {
    it('should create event with aggregateId and flashcard data', () => {
      const flashcard = { id: aggregateId } as Partial<Flashcard>;
      const event = new FlashcardUpdatedEvent({
        aggregateId,
        flashcard,
      });

      expect(event.aggregateId).toBe(aggregateId);
      expect(event.flashcard).toBe(flashcard);
      expect(event.id).toBeDefined();
    });
  });

  describe('FlashcardDeletedEvent', () => {
    it('should create event with aggregateId and flashcard data', () => {
      const event = new FlashcardDeletedEvent({
        aggregateId,
        flashcardId: aggregateId,
        userId: 'user-456',
        tenantId: 'tenant-789',
      });

      expect(event.aggregateId).toBe(aggregateId);
      expect(event.flashcardId).toBe(aggregateId);
      expect(event.userId).toBe('user-456');
      expect(event.tenantId).toBe('tenant-789');
      expect(event.id).toBeDefined();
    });
  });
});
