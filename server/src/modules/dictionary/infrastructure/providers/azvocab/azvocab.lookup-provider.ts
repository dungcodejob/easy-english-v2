import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Word } from 'src/modules/dictionary/domain/entities/word.aggregate';
import {
  EnrichmentContext,
  ILookupProvider,
  LookupResult,
} from '../../../domain/providers/lookup-provider.interface';
import { AzVocabAdapter } from './azvocab.adapter';
import { AzVocabHttpClient } from './azvocab.http-client';
import {
  AzVocabDefinitionResponseDto,
  AzVocabSearchResponseDto,
} from './azvocab.types';

/** Max definitions to fetch immediately before returning to FE */
const IMMEDIATE_FETCH_LIMIT = 8;
/** Delay between immediate definition fetches (ms) */
const IMMEDIATE_FETCH_DELAY_MS = 200;
/** Delay between background definition fetches (ms) */
const BACKGROUND_FETCH_DELAY_MS = 500;

@Injectable()
export class AzVocabLookupProvider implements ILookupProvider {
  readonly name = 'azvocab';
  private readonly logger = new Logger(AzVocabLookupProvider.name);

  constructor(
    private readonly httpClient: AzVocabHttpClient,
    private readonly adapter: AzVocabAdapter,
    private readonly configService: ConfigService,
  ) {}

  toDomain(raw: unknown): Word[] {
    const r = raw as {
      search: AzVocabSearchResponseDto[];
      definitions: AzVocabDefinitionResponseDto[];
    };

    if (!r || !r.search) {
      return [];
    }
    return this.mapToDomainWords(r.search, r.definitions || []);
  }

  async lookup(word: string): Promise<LookupResult> {
    try {
      // 1. Search for the word
      const searchResponses = await this.httpClient.search(word);
      if (!searchResponses || searchResponses.length === 0) {
        return { words: [], raw: null, status: 404 };
      }

      // 2. Collect unique definition IDs
      const allDefIds = this.collectDefIds(searchResponses);

      // 3. Split: fetch first N immediately, rest goes to background
      const immediateIds = allDefIds.slice(0, IMMEDIATE_FETCH_LIMIT);
      const hasRemaining = allDefIds.length > IMMEDIATE_FETCH_LIMIT;

      this.logger.log(
        `Word '${word}': ${allDefIds.length} defs total, fetching ${immediateIds.length} immediately`,
      );

      // 4. Fetch immediate definitions with rate limiting
      const definitions = await this.fetchWithDelay(
        immediateIds,
        IMMEDIATE_FETCH_DELAY_MS,
      );

      // 5. Map to domain (adapter handles partial senses for defs without full data)
      const words = this.mapToDomainWords(searchResponses, definitions);

      // 6. Build enrichment context if there are remaining defs
      const enrichmentContext: EnrichmentContext | undefined = hasRemaining
        ? {
            searchData: searchResponses,
            fetchedDefIds: immediateIds,
          }
        : undefined;

      return {
        words,
        raw: { search: searchResponses, definitions },
        status: words.length > 0 ? 200 : 404,
        enrichmentContext,
      };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }
      this.logger.error(
        `Lookup failed for word '${word}': ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new ServiceUnavailableException('Dictionary provider failed');
    }
  }

  async enrichRemaining(
    word: string,
    context: EnrichmentContext,
  ): Promise<Word[]> {
    const searchResponses = context.searchData as AzVocabSearchResponseDto[];
    const allDefIds = this.collectDefIds(searchResponses);
    const fetchedSet = new Set(context.fetchedDefIds);
    const remainingIds = allDefIds.filter((id) => !fetchedSet.has(id));

    if (remainingIds.length === 0) {
      return [];
    }

    this.logger.log(
      `Enriching '${word}': fetching ${remainingIds.length} remaining definitions`,
    );

    // Fetch remaining definitions with slower rate
    const remainingDefinitions = await this.fetchWithDelay(
      remainingIds,
      BACKGROUND_FETCH_DELAY_MS,
    );

    // Also re-fetch immediate defs from cache (they should be cached by now)
    const immediateDefinitions = await this.fetchWithDelay(
      context.fetchedDefIds,
      0, // No delay — these should come from cache
    );

    const allDefinitions = [...immediateDefinitions, ...remainingDefinitions];

    // Map complete Word[] with all definitions
    return this.mapToDomainWords(searchResponses, allDefinitions);
  }

  async isAvailable(): Promise<boolean> {
    const url = this.configService.get<string>('dictionary.azvocab.url');
    return Promise.resolve(!!url);
  }

  // ─── Private Helpers ───

  private collectDefIds(searchResponses: AzVocabSearchResponseDto[]): string[] {
    const defIds = new Set<string>();
    for (const entry of searchResponses) {
      if (entry.defs) {
        entry.defs.forEach((def) => {
          if (def.id) {
            defIds.add(def.id);
          }
        });
      }
    }
    return Array.from(defIds);
  }

  private mapToDomainWords(
    searchResponses: AzVocabSearchResponseDto[],
    definitions: AzVocabDefinitionResponseDto[],
  ): Word[] {
    const words: Word[] = [];

    // Group search responses by normalized text
    const groupedResponses = new Map<string, AzVocabSearchResponseDto[]>();
    for (const entry of searchResponses) {
      if (!entry.defs) continue;

      const normalizedText = entry.vocab.toLowerCase();
      if (!groupedResponses.has(normalizedText)) {
        groupedResponses.set(normalizedText, []);
      }
      groupedResponses.get(normalizedText)!.push(entry);
    }

    // Process each group
    for (const entriesGroup of groupedResponses.values()) {
      const allDefIdsForGroup = entriesGroup.flatMap((entry) =>
        entry.defs ? entry.defs.map((def) => def.id) : [],
      );

      const definitionsByGroup = definitions.filter(
        (def) =>
          def?.pageProps?.def?.id &&
          allDefIdsForGroup.includes(def.pageProps.def.id),
      );

      const word = this.adapter.toDomain(entriesGroup, definitionsByGroup);
      if (word) {
        words.push(word);
      }
    }

    return words;
  }

  private async fetchWithDelay(
    defIds: string[],
    delayMs: number,
  ): Promise<AzVocabDefinitionResponseDto[]> {
    const results: AzVocabDefinitionResponseDto[] = [];
    for (let i = 0; i < defIds.length; i++) {
      const def = await this.httpClient.getDefinitionById(defIds[i]);
      if (def) {
        results.push(def);
      }
      // Add delay between requests (skip after last one)
      if (delayMs > 0 && i < defIds.length - 1) {
        await this.delay(delayMs);
      }
    }
    return results;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
