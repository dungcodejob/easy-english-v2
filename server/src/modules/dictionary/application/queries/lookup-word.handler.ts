import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { EventBus, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { Cache } from 'cache-manager';
import { LookupMissedEvent } from '../../domain/events/lookup-missed.event';
import { LookupSucceededEvent } from '../../domain/events/lookup-succeeded.event';
import {
  LOOKUP_PROVIDER,
  type ILookupProvider,
} from '../../domain/providers/lookup-provider.interface';
import {
  WORD_READ_REPOSITORY,
  type IWordReadRepository,
} from '../../domain/repositories/word-read.repository.interface';
import { WordSnapshot } from '../../domain/value-objects/word-snapshot.vo';
import { LookupWordQuery } from './lookup-word.query';

@QueryHandler(LookupWordQuery)
export class LookupWordHandler implements IQueryHandler<LookupWordQuery> {
  private readonly logger = new Logger(LookupWordHandler.name);

  constructor(
    @Inject(WORD_READ_REPOSITORY)
    private readonly repo: IWordReadRepository,
    private readonly eventBus: EventBus,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(LOOKUP_PROVIDER) private readonly provider: ILookupProvider,
  ) {}

  async execute(query: LookupWordQuery): Promise<WordSnapshot> {
    const { word, tenantId, userId } = query;
    const normalizedWord = word.trim().toLowerCase();
    // const cacheKey = `word:${tenantId}:${normalizedWord}`;

    // TODO: Add NestJS CacheManager check here (Phase 1 T002/T019)
    // const cachedProps = await this.cacheManager.get<WordSnapshotProps>(cacheKey);
    // if (cachedProps) { ... }

    const snapshot = await this.repo.findByWord(normalizedWord, tenantId);

    if (snapshot) {
      this.eventBus.publish(
        new LookupSucceededEvent({
          aggregateId: snapshot.normalizedText,
          word: snapshot.normalizedText,
          source: snapshot.source,
          tenantId,
          userId,
        }),
      );
      return snapshot;
    }

    // Provider Fallback
    try {
      const result = await this.provider.lookup(normalizedWord);

      if (result.snapshot) {
        // Found in external provider
        // Emit LookupSucceeded because the USER got the word
        this.eventBus.publish(
          new LookupSucceededEvent({
            aggregateId: result.snapshot.normalizedText,
            word: result.snapshot.normalizedText,
            source: result.snapshot.source,
            tenantId,
            userId,
          }),
        );

        // Emit LookupMissed because it was missing from internal DB (trigger enrichment)
        this.eventBus.publish(
          new LookupMissedEvent({
            aggregateId: normalizedWord,
            word: normalizedWord,
            tenantId,
            userId,
          }),
        );
        return result.snapshot;
      }
    } catch (error) {
      this.logger.warn(
        `Provider lookup failed for ${normalizedWord}: ${error}`,
      );
      // Fall through to NotFound
    }

    this.eventBus.publish(
      new LookupMissedEvent({
        aggregateId: normalizedWord,
        word: normalizedWord,
        tenantId,
        userId,
      }),
    );

    throw new NotFoundException(`Word '${word}' not found in dictionary.`);
  }
}
