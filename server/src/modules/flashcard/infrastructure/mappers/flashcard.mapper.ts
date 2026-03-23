import { Mapper } from '@core/ddd';
import { Flashcard } from '../../domain/entities/flashcard.aggregate';
import { FlashcardOrmEntity } from '../persistence/flashcard.orm-entity';
import { FlashcardId } from '../../domain/value-objects/flashcard-id.vo';
import { FlashcardSource } from '../../domain/value-objects/flashcard-source.vo';
import { FsrsParameters } from '../../domain/value-objects/fsrs-parameters.vo';
import { CardState } from '../../domain/value-objects/card-state.vo';
import { FlashcardSchedulingStateOrmEntity } from '../persistence/flashcard-scheduling-state.orm-entity';

export class FlashcardMapper implements Mapper<Flashcard, FlashcardOrmEntity, object> {
  toDomain(orm: FlashcardOrmEntity): Flashcard {
    const state = orm.schedulingState;
    const params = new FsrsParameters({
      stability: state?.stability ?? 0,
      difficulty: state?.difficulty ?? 0,
      lapses: state?.lapses ?? 0,
      reps: state?.reps ?? 0,
      state: CardState.from(state?.state ?? 'new'),
      dueDate: state?.dueDate ?? null,
      lastReviewDate: state?.lastReviewDate ?? null,
    });

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
        schedulingState: params,
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

    const stateOrm = new FlashcardSchedulingStateOrmEntity(domain.id);
    stateOrm.stability = domain.schedulingState.stability;
    stateOrm.difficulty = domain.schedulingState.difficulty;
    stateOrm.lapses = domain.schedulingState.lapses;
    stateOrm.reps = domain.schedulingState.reps;
    stateOrm.state = domain.schedulingState.state.value;
    stateOrm.dueDate = domain.schedulingState.dueDate ?? new Date();
    stateOrm.lastReviewDate = domain.schedulingState.lastReviewDate ?? undefined;
    orm.schedulingState = stateOrm;

    return orm;
  }

  toResponse(domain: Flashcard): object {
    return {
      id: domain.id,
      front: domain.front,
      back: domain.back,
      hint: domain.hint,
      notes: domain.notes,
      source: domain.source.value,
      wordSenseId: domain.wordSenseId,
      state: domain.schedulingState.state.value,
      dueDate: domain.schedulingState.dueDate?.toISOString() ?? null,
      createdAt: domain.createdAt.toISOString(),
      updatedAt: domain.updatedAt.toISOString(),
    };
  }
}
