import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { WordEnrichmentRequestedEvent } from '../../domain/events/word-enrichment-requested.event';
import {
  lookupProviderToken,
  type ILookupProvider,
} from '../../domain/providers/lookup-provider.interface';
import {
  wordReadRepositoryToken,
  type IWordReadRepository,
} from '../../domain/repositories/word-read.repository.interface';

/**
 * Background handler — listens for WordEnrichmentRequestedEvent
 * and fetches remaining definitions with slower rate limiting.
 * Updates existing Word aggregates with enriched senses.
 */
@EventsHandler(WordEnrichmentRequestedEvent)
@Injectable()
export class WordEnrichmentHandler implements IEventHandler<WordEnrichmentRequestedEvent> {
  private readonly logger = new Logger(WordEnrichmentHandler.name);

  constructor(
    @Inject(lookupProviderToken)
    private readonly provider: ILookupProvider,
    @Inject(wordReadRepositoryToken)
    private readonly readRepo: IWordReadRepository,
    private readonly eventBus: EventBus,
  ) {}

  async handle(event: WordEnrichmentRequestedEvent): Promise<void> {
    const { normalizedWord, enrichmentContext } = event;

    try {
      this.logger.log(`Starting background enrichment for '${normalizedWord}'`);

      // 1. Fetch remaining definitions via provider
      const enrichedWords = await this.provider.enrichRemaining(
        normalizedWord,
        enrichmentContext,
      );

      if (!enrichedWords || enrichedWords.length === 0) {
        this.logger.warn(`No enriched words returned for '${normalizedWord}'`);
        return;
      }

      // 2. Load existing words from DB
      const existingWords = await this.readRepo.findByWord(normalizedWord);

      if (!existingWords || existingWords.length === 0) {
        this.logger.warn(
          `No existing words found in DB for '${normalizedWord}', skipping enrichment`,
        );
        return;
      }

      // 3. Update existing words with enriched data
      for (const enrichedWord of enrichedWords) {
        const existing = existingWords.find(
          (w) => w.normalizedText.value === enrichedWord.normalizedText.value,
        );

        if (existing) {
          // Use aggregate's updateFromProvider — emits WordUpdatedEvent if data changed
          existing.updateFromProvider({
            text: enrichedWord.text,
            normalizedText: enrichedWord.normalizedText,
            language: enrichedWord.language,
            source: enrichedWord.source,
            rank: enrichedWord.rank,
            frequency: enrichedWord.frequency,
            pronunciations: enrichedWord.pronunciations,
            senses: enrichedWord.senses,
            inflects: enrichedWord.inflects,
            wordFamily: enrichedWord.wordFamily,
          });

          existing.publishEvents(this.logger, this.eventBus);

          this.logger.log(
            `Enriched word '${existing.normalizedText.value}' with ${enrichedWord.senses.length} senses`,
          );
        }
      }

      this.logger.log(
        `Background enrichment completed for '${normalizedWord}'`,
      );
    } catch (error) {
      // Non-critical: log and swallow — don't crash background processing
      this.logger.error(
        `Background enrichment failed for '${normalizedWord}': ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }
}
