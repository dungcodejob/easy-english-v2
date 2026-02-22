import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  type ILookupProvider,
  InjectLookupProvider,
  LookupResult,
} from '../../domain/providers/lookup-provider.interface';
import {
  InjectProviderCacheRepository,
  type IProviderCacheRepository,
} from '../../domain/repositories/provider-cache.repository.interface';
import { WordSnapshot } from '../../domain/value-objects/word-snapshot.vo';
import { ProviderResponseCacheOrmEntity } from '../persistence/provider-response-cache.orm-entity';

@Injectable()
export class CachingProviderDecorator implements ILookupProvider {
  private readonly logger = new Logger(CachingProviderDecorator.name);

  constructor(
    @InjectLookupProvider()
    private readonly inner: ILookupProvider,
    @InjectProviderCacheRepository()
    private readonly cacheRepository: IProviderCacheRepository,
    private readonly configService: ConfigService,
  ) {}

  get name(): string {
    return this.inner.name;
  }

  toDomain(raw: any): WordSnapshot[] {
    return this.inner.toDomain(raw);
  }

  isAvailable(): Promise<boolean> {
    return this.inner.isAvailable();
  }

  async lookup(word: string): Promise<LookupResult> {
    const normalizedWord = word.trim().toLowerCase();
    const providerName = this.inner.name;

    try {
      const cached = await this.cacheRepository.findByWord(
        normalizedWord,
        providerName,
      );

      if (cached && cached.expiresAt > new Date()) {
        // HIT
        if (cached.httpStatus === 404) {
          return {
            snapshots: [],
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            raw: cached.rawResponse as unknown as any,
            status: 404,
          };
        }

        // Only treat as valid hit if we can map it or it's a known raw response
        if (cached.httpStatus >= 200 && cached.httpStatus < 300) {
          const snapshots = this.toDomain(cached.rawResponse);
          return {
            snapshots: snapshots,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            raw: cached.rawResponse as unknown as any,
            status: cached.httpStatus,
          };
        }
      }
    } catch (error) {
      this.logger.warn(
        `Cache read failed for '${word}': ${(error as Error).message}`,
      );
    }

    // MISS -> Call Inner Provider
    const result = await this.inner.lookup(word);

    // Async Save (Fire-and-forget)
    // We only cache if we got a definitive result (200 or 404).
    // 5xx errors from provider should NOT be cached.
    if (result.status === 200 || result.status === 404) {
      this.saveToCacheAsync(normalizedWord, providerName, result).catch(
        (err) => {
          this.logger.error(
            `Failed to save cache for '${normalizedWord}': ${(err as Error).message}`,
          );
        },
      );
    }

    return result;
  }

  private async saveToCacheAsync(
    normalizedWord: string,
    provider: string,
    result: LookupResult,
  ): Promise<void> {
    if (!result.raw && result.status !== 404) return;

    const ttlDays =
      this.configService.get<number>('dictionary.providerCache.ttlDays') || 90;
    const ttl404Hours =
      this.configService.get<number>('dictionary.providerCache.ttl404Hours') ||
      24;

    const now = new Date();
    const expiresAt = new Date(now);

    if (result.status === 404) {
      expiresAt.setHours(expiresAt.getHours() + ttl404Hours);
    } else {
      expiresAt.setDate(expiresAt.getDate() + ttlDays);
    }

    const entity = new ProviderResponseCacheOrmEntity();
    entity.normalizedWord = normalizedWord;
    entity.provider = provider;
    entity.rawResponse = result.raw || {};
    entity.httpStatus = result.status;
    entity.expiresAt = expiresAt;

    await this.cacheRepository.saveAsync(entity);
  }
}
