import { FlashcardOrmEntity } from '../infrastructure/persistence/flashcard.orm-entity';

describe('FlashcardOrmEntity', () => {
  it('should create a flashcard entity', () => {
    const flashcard = new FlashcardOrmEntity(
      'tenant-1',
      'user-1',
      'Hello',
      'Xin chào',
      'custom',
    );

    expect(flashcard.front).toBe('Hello');
    expect(flashcard.back).toBe('Xin chào');
    expect(flashcard.source).toBe('custom');
    expect(flashcard.id).toBeDefined();
  });
});
