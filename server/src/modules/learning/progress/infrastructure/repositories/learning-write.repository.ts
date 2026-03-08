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

    return UserWordSenseProgressMapper.toDomain(ormEntity);
  }

  async save(progress: UserWordSenseProgress): Promise<void> {
    await this.em.transactional(async (em) => {
      let ormEntity = await em.findOne(UserWordSenseProgressOrmEntity, {
        id: progress.id,
      });

      if (!ormEntity) {
        ormEntity = new UserWordSenseProgressOrmEntity();
        ormEntity.id = progress.id;
        ormEntity.userId = progress.userId;
        ormEntity.wordSense = em.getReference(
          WordSenseOrmEntity,
          progress.wordSenseId,
        );
      }

      ormEntity.masteryLevel = progress.masteryLevel;
      ormEntity.reviewCount = progress.reviewCount;
      ormEntity.nextReviewAt = progress.nextReviewAt;
      ormEntity.lastReviewedAt = progress.lastReviewedAt;
      ormEntity.archivedAt = progress.archivedAt;
      ormEntity.createdAt = progress.createdAt;
      ormEntity.updatedAt = progress.updatedAt;

      em.persist(ormEntity);
    });

    this.logger.debug(
      `Saved UserWordSenseProgress for user ${progress.userId} and sense ${progress.wordSenseId}`,
    );
  }
}
