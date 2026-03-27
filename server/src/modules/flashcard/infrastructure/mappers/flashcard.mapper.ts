import { type Mapper } from '@core/ddd';

import { Flashcard } from '../../domain/entities/flashcard.aggregate';
import { FlashcardSource } from '../../domain/value-objects/flashcard-source.vo';
import { FlashcardOrmEntity } from '../persistence/flashcard.orm-entity';

export class FlashcardMapper implements Mapper<
  Flashcard,
  FlashcardOrmEntity,
  object
> {
  toDomain(orm: FlashcardOrmEntity): Flashcard {
    return Flashcard.rehydrate(
      {
        id: orm.id,
        tenantId: orm.tenantId,
        userId: orm.userId,
        front: orm.front,
        back: orm.back,
        hint: orm.hint ?? null,
        notes: orm.notes ?? null,
        source: FlashcardSource.from(orm.source),
        wordSenseId: orm.wordSenseId ?? null,
      },
      orm.createdAt,
      orm.updatedAt,
    );
  }

  toPersistence(domain: Flashcard): FlashcardOrmEntity {
    const orm = new FlashcardOrmEntity(
      domain.tenantId,
      domain.userId,
      domain.front,
      domain.back,
      domain.source.value,
      domain.hint ?? undefined,
      domain.notes ?? undefined,
      domain.wordSenseId ?? undefined,
    );

    orm.id = domain.id;

    return orm;
  }

  toResponse(domain: Flashcard): object {
    // Note: scheduling state (state, dueDate) is no longer stored on Flashcard.
    // Review result (newState, nextDueDate, isMastered) is returned separately
    // by ReviewCardHandler in ReviewResultResponseDto.
    return {
      id: domain.id,
      front: domain.front,
      back: domain.back,
      hint: domain.hint,
      notes: domain.notes,
      source: domain.source.value,
      wordSenseId: domain.wordSenseId,
      createdAt: domain.createdAt.toISOString(),
      updatedAt: domain.updatedAt.toISOString(),
    };
  }
}
