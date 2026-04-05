import { Injectable, Logger } from '@nestjs/common';

import { EntityManager } from '@mikro-orm/postgresql';

import { IProviderCacheRepository } from '../../domain/repositories/provider-cache.repository.interface';
import { ProviderResponseCacheOrmEntity } from '../persistence/provider-response-cache.orm-entity';

@Injectable()
export class ProviderCacheRepository implements IProviderCacheRepository {
  private readonly logger = new Logger(ProviderCacheRepository.name);

  constructor(private readonly em: EntityManager) {}

  async findByWord(
    normalizedWord: string,
    provider: string,
  ): Promise<ProviderResponseCacheOrmEntity | null> {
    return this.em.findOne(ProviderResponseCacheOrmEntity, {
      normalizedWord,
      provider,
    });
  }

  async findManyByWords(
    normalizedWords: string[],
    provider: string,
  ): Promise<ProviderResponseCacheOrmEntity[]> {
    if (!normalizedWords.length) {
      return [];
    }

    return this.em.find(ProviderResponseCacheOrmEntity, {
      normalizedWord: { $in: normalizedWords },
      provider,
    });
  }

  saveAsync(entity: ProviderResponseCacheOrmEntity): Promise<void> {
    const fork = this.em.fork();

    void (async () => {
      try {
        await fork.upsert(ProviderResponseCacheOrmEntity, entity);
        await fork.flush();
      } catch (error) {
        this.logger.error(
          `Failed to save provider cache for word ${entity.normalizedWord}: ${(error as Error).message}`,
          (error as Error).stack,
        );
      }
    })();

    return Promise.resolve();
  }
}
