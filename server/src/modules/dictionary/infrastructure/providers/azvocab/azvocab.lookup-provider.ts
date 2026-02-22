import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ILookupProvider,
  LookupResult,
} from '../../../domain/providers/lookup-provider.interface';
import { WordSnapshot } from '../../../domain/value-objects/word-snapshot.vo';
import { AzVocabAdapter } from './azvocab.adapter';
import { AzVocabHttpClient } from './azvocab.http-client';
import {
  AzVocabDefinitionResponseDto,
  AzVocabSearchResponseDto,
} from './azvocab.types';

@Injectable()
export class AzVocabLookupProvider implements ILookupProvider {
  readonly name = 'azvocab';
  private readonly logger = new Logger(AzVocabLookupProvider.name);

  constructor(
    private readonly httpClient: AzVocabHttpClient,
    private readonly adapter: AzVocabAdapter,
    private readonly configService: ConfigService,
  ) {}

  toDomain(raw: unknown): WordSnapshot[] {
    // This method is part of ILookupProvider but primarily used for cache hydration from raw JSON
    // Raw JSON stored in cache should match the structure we return in lookup(): { search: [], definitions: [] }
    const r = raw as {
      search: AzVocabSearchResponseDto;
      definitions: AzVocabDefinitionResponseDto[];
    }[];

    if (!r || !r.length) {
      return [];
    }
    return r.map((entry) =>
      this.adapter.toDomain(entry.search, entry.definitions),
    );
  }

  async lookup(word: string): Promise<LookupResult> {
    try {
      // 1. Search for the word
      const searchResponses = await this.httpClient.search(word);
      if (!searchResponses || searchResponses.length === 0) {
        return { snapshots: [], raw: null, status: 404 };
      }

      // 2. Fetch full definitions for each definition ID found
      const definitionPromises: Promise<AzVocabDefinitionResponseDto | null>[] =
        [];

      // Collect unique definition IDs across all search entries
      const defIds = new Set<string>();
      for (const entry of searchResponses) {
        if (entry.defs) {
          entry.defs.forEach((def) => {
            if (def.id && !defIds.has(def.id)) {
              defIds.add(def.id);
              definitionPromises.push(
                this.httpClient.getDefinitionById(def.id),
              );
            }
          });
        }
      }

      // Execute all definition fetches in parallel
      const definitionResultsRaw = await Promise.all(definitionPromises);
      const definitions = definitionResultsRaw.filter(
        (d): d is AzVocabDefinitionResponseDto => d !== null,
      );

      const snapshots: WordSnapshot[] = [];

      for (const entry of searchResponses) {
        if (!entry.defs) {
          continue;
        }
        const definitionsByEntry = definitions.filter(
          (def) => def.pageProps.def.id === entry.id,
        );

        const snapshot = this.adapter.toDomain(entry, definitionsByEntry);
        if (snapshot) {
          snapshots.push(snapshot);
        }
      }

      // 3. Map to Domain

      // 4. Construct Result
      return {
        snapshots,
        raw: {
          search: searchResponses,
          definitions,
        },
        status: snapshots.length > 0 ? 200 : 404, // If mapped snapshot is null, treat as not found?
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

  async isAvailable(): Promise<boolean> {
    const url = this.configService.get<string>('dictionary.azvocab.url');
    return Promise.resolve(!!url);
  }
}
