import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { EventBus, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { Cache } from 'cache-manager';
import { LookupMissedEvent } from '../../domain/events/lookup-missed.event';
import { LookupSucceededEvent } from '../../domain/events/lookup-succeeded.event';
import { WordEnrichedEvent } from '../../domain/events/word-enriched.event';
import {
  lookupProviderToken,
  type ILookupProvider,
} from '../../domain/providers/lookup-provider.interface';
import {
  wordReadRepositoryToken,
  type IWordReadRepository,
} from '../../domain/repositories/word-read.repository.interface';
import { WordSnapshot } from '../../domain/value-objects/word-snapshot.vo';
import { LookupWordQuery } from './lookup-word.query';

@QueryHandler(LookupWordQuery)
export class LookupWordHandler implements IQueryHandler<LookupWordQuery> {
  private readonly logger = new Logger(LookupWordHandler.name);

  constructor(
    @Inject(wordReadRepositoryToken)
    private readonly repo: IWordReadRepository,
    private readonly eventBus: EventBus,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(lookupProviderToken) private readonly provider: ILookupProvider,
  ) {}

  async execute(query: LookupWordQuery): Promise<WordSnapshot[]> {
    const { word, tenantId, userId } = query;
    const normalizedWord = word.trim().toLowerCase();
    // const cacheKey = `word:${tenantId}:${normalizedWord}`;

    // TODO: Add NestJS CacheManager check here (Phase 1 T002/T019)
    // const cachedProps = await this.cacheManager.get<WordSnapshotProps>(cacheKey);
    // if (cachedProps) { ... }

    const existingSnapshots = await this.repo.findByWord(
      normalizedWord,
      tenantId,
    );

    if (existingSnapshots && existingSnapshots.length > 0) {
      this.eventBus.publish(
        new LookupSucceededEvent({
          aggregateId: normalizedWord,
          words: existingSnapshots.map((snapshot) => snapshot.normalizedText),
          sources: existingSnapshots.map((snapshot) => snapshot.source),
          tenantId,
          userId,
        }),
      );

      return existingSnapshots;
    }

    // Provider Fallback
    try {
      const timeoutMs = 3000;
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(new Error('Dictionary provider timeout exceeded 3000ms')),
          timeoutMs,
        ),
      );

      const result = await Promise.race([
        this.provider.lookup(normalizedWord),
        timeoutPromise,
      ]);

      if (result.snapshots && result.snapshots.length > 0) {
        const newSnapshots = result.snapshots;
        // Found in external provider
        // Emit LookupSucceeded because the USER got the word
        for (const snapshot of newSnapshots) {
          this.eventBus.publish(
            new WordEnrichedEvent({
              aggregateId: snapshot.normalizedText,
              snapshot,
              tenantId,
            }),
          );
        }

        const words = newSnapshots.map((snapshot) => snapshot.normalizedText);
        const sources = newSnapshots.map((snapshot) => snapshot.source);

        this.eventBus.publish(
          new LookupSucceededEvent({
            aggregateId: normalizedWord,
            words: words,
            sources: sources,
            tenantId,
            userId,
          }),
        );

        // Emit LookupMissed because it was missing from internal DB (trigger enrichment logging/metrics)
        this.eventBus.publish(
          new LookupMissedEvent({
            aggregateId: normalizedWord,
            word: normalizedWord,
            tenantId,
            userId,
          }),
        );

        // Emit WordEnrichedEvent to persist the snapshot asynchronously

        return newSnapshots;
      }
    } catch (error) {
      const err = error as { code?: string; name?: string; message?: string };
      if (
        err &&
        (err.code === 'ECONNABORTED' ||
          err.name === 'TimeoutError' ||
          err.message === 'Dictionary provider timeout exceeded 3000ms')
      ) {
        this.logger.error(
          `Lookup total budget (3000ms) exceeded for ${normalizedWord}`,
        );
        throw new ServiceUnavailableException(
          'Dictionary provider unavailable or too slow.',
        );
      }
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
