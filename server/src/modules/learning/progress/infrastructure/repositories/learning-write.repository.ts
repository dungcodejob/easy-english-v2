import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, Logger } from '@nestjs/common';
import { WordSenseOrmEntity } from 'src/modules/dictionary/infrastructure/persistence/word-sense.orm-entity';
import { UserWordSenseProgress } from '../../domain/entities/user-word-sense-progress.entity';
import { ILearningWriteRepository } from '../../domain/repositories/learning-write.repository.interface';
import { UserWordSenseProgressMapper } from '../mappers/user-word-sense-progress.mapper';
import { UserWordSenseProgressOrmEntity } from '../persistence/user-word-sense-progress.orm-entity';

@Injectable()
export class LearningWriteRepository implements ILearningWriteRepository {
  private readonly logger = new Logger(LearningWriteRepository.name);
  private readonly mapper = new UserWordSenseProgressMapper();

  constructor(private readonly em: EntityManager) {}

  async findOneByUserAndSense(
    userId: string,
    wordSenseId: string,
  ): Promise<UserWordSenseProgress | null> {
    const ormEntity = await this.em.findOne(
      UserWordSenseProgressOrmEntity,
      {
        userId,
        wordSense: { id: wordSenseId },
      },
      { populate: ['wordSense'] },
    );

    if (!ormEntity) {
      return null;
    }

    return this.mapper.toDomain(ormEntity);
  }

  async save(progress: UserWordSenseProgress): Promise<void> {
    let ormEntity = await this.em.findOne(UserWordSenseProgressOrmEntity, {
      id: progress.id,
    });

    if (!ormEntity) {
      ormEntity = new UserWordSenseProgressOrmEntity();
      ormEntity.id = progress.id;
      ormEntity.userId = progress.userId;
      ormEntity.tenantId = progress.tenantId;
      ormEntity.wordSense = this.em.getReference(
        WordSenseOrmEntity,
        progress.wordSenseId,
      );
    }

    // Map all fields (including new FSRS columns)
    const mapped = this.mapper.toPersistence(progress);
    ormEntity.stability = mapped.stability;
    ormEntity.difficulty = mapped.difficulty;
    ormEntity.lapses = mapped.lapses;
    ormEntity.reps = mapped.reps;
    ormEntity.state = mapped.state;
    ormEntity.dueDate = mapped.dueDate;
    ormEntity.lastReviewDate = mapped.lastReviewDate;
    ormEntity.masteryLevel = mapped.masteryLevel;
    ormEntity.reviewCount = mapped.reviewCount;
    ormEntity.nextReviewAt = mapped.nextReviewAt;
    ormEntity.lastReviewedAt = mapped.lastReviewedAt;
    ormEntity.archivedAt = mapped.archivedAt;
    ormEntity.createdAt = mapped.createdAt;
    ormEntity.updatedAt = mapped.updatedAt;

    this.em.persist(ormEntity);
    // flush() is called at the handler layer — single UoW boundary

    this.logger.debug(
      `Saved UserWordSenseProgress for user ${progress.userId} and sense ${progress.wordSenseId}`,
    );
  }
}
