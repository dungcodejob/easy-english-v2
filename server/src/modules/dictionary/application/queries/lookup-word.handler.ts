import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { EventBus, IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { LookupWordQuery } from './lookup-word.query';
import { Word } from '../../domain/entities/word.aggregate';
import { LookupMissedEvent } from '../../domain/events/lookup-missed.event';
import { LookupSucceededEvent } from '../../domain/events/lookup-succeeded.event';
import { WordEnrichmentRequestedEvent } from '../../domain/events/word-enrichment-requested.event';
import {
  lookupProviderToken,
  type ILookupProvider,
} from '../../domain/providers/lookup-provider.interface';
import {
  wordReadRepositoryToken,
  type IWordReadRepository,
} from '../../domain/repositories/word-read.repository.interface';

import type { Cache } from 'cache-manager';

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

  async execute(query: LookupWordQuery): Promise<Word[]> {
    const { word, tenantId, userId } = query;
    const normalizedWord = word.trim().toLowerCase();
    // const cacheKey = `word:${tenantId}:${normalizedWord}`;

    // TODO: Add NestJS CacheManager check here (Phase 1 T002/T019)
    // const cachedProps = await this.cacheManager.get<WordProps>(cacheKey);
    // if (cachedProps) { ... }

    const existingWords = await this.repo.findByWord(normalizedWord);

    if (existingWords && existingWords.length > 0) {
      this.eventBus.publish(
        new LookupSucceededEvent({
          aggregateId: normalizedWord,
          words: existingWords.map((w) => w.normalizedText.value),
          sources: existingWords.map((w) => w.source.value),
          tenantId,
          userId,
        }),
      );

      return existingWords;
    }

    // Provider Fallback
    try {
      const timeoutMs = 5000;
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(new Error('Dictionary provider timeout exceeded 5000ms')),
          timeoutMs,
        ),
      );

      const result = await Promise.race([
        this.provider.lookup(normalizedWord),
        timeoutPromise,
      ]);

      if (result.words && result.words.length > 0) {
        const newWords = result.words;

        // Found in external provider
        for (const newWord of newWords) {
          // Publish aggregate domain events (WordCreatedEvent)
          newWord.domainEvents.forEach((event) => {
            this.eventBus.publish(event);
          });
        }

        const words = newWords.map((w) => w.normalizedText.value);
        const sources = newWords.map((w) => w.source.value);

        this.eventBus.publish(
          new LookupSucceededEvent({
            aggregateId: normalizedWord,
            words,
            sources,
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

        // Schedule background enrichment if provider has remaining defs to fetch
        if (result.enrichmentContext) {
          this.logger.log(
            `Scheduling background enrichment for '${normalizedWord}'`,
          );
          this.eventBus.publish(
            new WordEnrichmentRequestedEvent(
              normalizedWord,
              result.enrichmentContext,
            ),
          );
        }

        return newWords;
      }
    } catch (error) {
      const err = error as { code?: string; name?: string; message?: string };

      if (
        err &&
        (err.code === 'ECONNABORTED' ||
          err.name === 'TimeoutError' ||
          err.message === 'Dictionary provider timeout exceeded 5000ms')
      ) {
        this.logger.error(
          `Lookup total budget (5000ms) exceeded for ${normalizedWord}`,
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
