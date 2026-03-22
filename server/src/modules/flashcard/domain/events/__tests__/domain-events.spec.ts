import {
  FlashcardCreatedEvent,
  FlashcardUpdatedEvent,
  FlashcardDeletedEvent,
  CardReviewedEvent,
} from '../index';
import { CardState } from '../../value-objects/card-state.vo';
import { ReviewRating } from '../../value-objects/review-rating.vo';
import { FsrsParameters } from '../../value-objects/fsrs-parameters.vo';

describe('Flashcard Domain Events', () => {
  const aggregateId = 'flashcard-123';

  describe('FlashcardCreatedEvent', () => {
    it('should create event with aggregateId and flashcard data', () => {
      const flashcard = { id: aggregateId } as any;
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
        flashcard: {} as any,
        metadata: { correlationId: 'corr-1', userId: 'user-1' },
      });

      expect(event.metadata.correlationId).toBe('corr-1');
      expect(event.metadata.userId).toBe('user-1');
    });
  });

  describe('FlashcardUpdatedEvent', () => {
    it('should create event with aggregateId and flashcard data', () => {
      const flashcard = { id: aggregateId } as any;
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

  describe('CardReviewedEvent', () => {
    it('should create event with all review payload fields', () => {
      const cardId = aggregateId;
      const userId = 'user-456';
      const tenantId = 'tenant-789';
      const rating = ReviewRating.Good;
      const newParams = FsrsParameters.newCardDefaults();
      const reviewDurationMs = 2500;
      const previousState = CardState.NEW;
      const newState = CardState.LEARNING;

      const event = new CardReviewedEvent({
        aggregateId: cardId,
        cardId,
        userId,
        tenantId,
        rating,
        newParams,
        reviewDurationMs,
        previousState,
        newState,
      });

      expect(event.aggregateId).toBe(cardId);
      expect(event.cardId).toBe(cardId);
      expect(event.userId).toBe(userId);
      expect(event.tenantId).toBe(tenantId);
      expect(event.rating).toBe(rating);
      expect(event.newParams).toBe(newParams);
      expect(event.reviewDurationMs).toBe(reviewDurationMs);
      expect(event.previousState).toBe(previousState);
      expect(event.newState).toBe(newState);
      expect(event.id).toBeDefined();
    });

  });
});
