// Jest setup file — runs before all test files
// Initializes MikroORM metadata so Collection.add() works in domain unit tests

// Set DATABASE_URL to a dummy value so MikroORM.init() doesn't try to connect to a real DB
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

import { MikroORM } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Topic } from './modules/learning/topic/domain/entities/topic.aggregate';
import { TopicWord } from './modules/learning/topic/domain/entities/topic-word.entity';
import { StudySessionOrmEntity } from './modules/learning/study/infrastructure/persistence/study-session.orm-entity';
import { StudyReviewLogOrmEntity } from './modules/learning/study/infrastructure/persistence/study-review-log.orm-entity';
import { UserWordSenseProgressOrmEntity } from './modules/learning/progress/infrastructure/persistence/user-word-sense-progress.orm-entity';

beforeAll(async () => {
  const orm = await MikroORM.init({
    driver: PostgreSqlDriver,
    dbName: ':memory:',
    metadataProvider: TsMorphMetadataProvider,
    // Only discover Topic-related entities to avoid broken imports in unrelated modules
    entities: [
      Topic,
      TopicWord,
      StudySessionOrmEntity,
      StudyReviewLogOrmEntity,
      UserWordSenseProgressOrmEntity,
    ],
  });
  // Keep orm reference for the test session
  (global as any).__MikroORM__ = orm;
});

afterAll(async () => {
  const orm = (global as any).__MikroORM__;
  if (orm) {
    await orm.close(true);
  }
});
