import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ILookupProvider,
  LookupResult,
} from '../../domain/providers/lookup-provider.interface';
import { IProviderCacheRepository } from '../../domain/repositories/provider-cache.repository.interface';
import { WordSnapshot } from '../../domain/value-objects/word-snapshot.vo';
import { ProviderResponseCacheOrmEntity } from '../persistence/provider-response-cache.orm-entity';

export class CachingProviderDecorator implements ILookupProvider {
  private readonly logger = new Logger(CachingProviderDecorator.name);

  constructor(
    private readonly inner: ILookupProvider,
    private readonly cacheRepo: IProviderCacheRepository,
    private readonly configService: ConfigService,
  ) {}

  get name(): string {
    return this.inner.name;
  }

  mapResponse(raw: any): WordSnapshot | null {
    return this.inner.mapResponse(raw);
  }

  async isAvailable(): Promise<boolean> {
    return this.inner.isAvailable();
  }

  async lookup(word: string): Promise<LookupResult> {
    const normalizedWord = word.trim().toLowerCase();
    const providerName = this.inner.name;

    try {
      const cached = await this.cacheRepo.findByWord(
        normalizedWord,
        providerName,
      );

      if (cached) {
        // HIT
        if (cached.expiresAt > new Date()) {
          // Valid
          if (cached.httpStatus === 404) {
            return {
              snapshot: null,
              raw: cached.rawResponse,
              status: 404,
            };
          }
          if (cached.httpStatus >= 200 && cached.httpStatus < 300) {
            const snapshot = this.mapResponse(cached.rawResponse);
            return {
              snapshot,
              raw: cached.rawResponse,
              status: cached.httpStatus,
            };
          }
        }
        // If expired or invalid status, fall through to fetch
      }
    } catch (error) {
      this.logger.warn(`Cache read error: ${error}`);
    }

    // MISS -> Fetch from inner
    const result = await this.inner.lookup(word);

    // Save async
    this.saveToCache(normalizedWord, providerName, result).catch((err) =>
      this.logger.error(`Cache write error: ${err}`),
    );

    return result;
  }

  private async saveToCache(
    normalizedWord: string,
    provider: string,
    res: LookupResult,
  ) {
    let ttlHours =
      (this.configService.get<number>('dictionary.cache.providerTtlDays') ||
        90) * 24;

    if (res.status === 404) {
      ttlHours =
        this.configService.get<number>(
          'dictionary.cache.provider404TtlHours',
        ) || 24;
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + ttlHours);

    const entity = new ProviderResponseCacheOrmEntity();
    entity.normalizedWord = normalizedWord;
    entity.provider = provider;
    entity.rawResponse = res.raw;
    entity.httpStatus = res.status; // status? LookupResult has status.
    entity.expiresAt = expiresAt;

    await this.cacheRepo.saveAsync(entity);
  }
}
