import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { type DictionaryConfig, InjectDictionaryConfig } from 'src/configs';
import {
  InjectProviderCacheRepository,
  type IProviderCacheRepository,
} from '../../../domain/repositories/provider-cache.repository.interface';
import { ProviderResponseCacheOrmEntity } from '../../persistence/provider-response-cache.orm-entity';
import {
  AzVocabDefinitionResponseDto,
  AzVocabSearchResponseDto,
} from './azvocab.types';

export enum AzVocabCacheProvider {
  Search = 'azvocab-search',
  Definition = 'azvocab-definition',
}

@Injectable()
export class AzVocabHttpClient {
  private readonly logger = new Logger(AzVocabHttpClient.name);
  private readonly baseUrl: string;
  private readonly cookie: string;
  private readonly buildId: string;
  private readonly timeout: number;

  constructor(
    private readonly httpService: HttpService,
    @InjectDictionaryConfig()
    private readonly configService: DictionaryConfig,
    @InjectProviderCacheRepository()
    private readonly cacheRepository: IProviderCacheRepository,
  ) {
    this.baseUrl = this.configService.azVocab.url || 'https://azvocab.com';
    this.cookie = this.configService.azVocab.cookie || '';
    this.buildId = this.configService.azVocab.buildId;
    this.timeout = this.configService.azVocab.timeoutMs;
  }

  private buildHeaders(defId?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Origin: 'https://azvocab.ai',
      Pragma: 'no-cache',
      Connection: 'keep-alive',
      Referer: defId
        ? `https://azvocab.ai/vi/definition/${encodeURIComponent(defId)}`
        : 'https://azvocab.ai/dashboard',
      'sec-ch-ua-platform': '"Windows"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0',
      purpose: 'prefetch',
      'sec-ch-ua':
        '"Microsoft Edge";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
    };

    const cookie = this.cookie;
    if (cookie) {
      headers['Cookie'] = cookie;
    }

    return headers;
  }

  async search(word: string): Promise<AzVocabSearchResponseDto[]> {
    if (!this.cookie) {
      this.logger.error('AzVocab Cookie not configured');
      throw new ServiceUnavailableException('Dictionary provider unavailable');
    }

    try {
      const normalizedWord = word.trim().toLowerCase();

      // 1. Check search cache first
      const cached = await this.cacheRepository.findByWord(
        normalizedWord,
        AzVocabCacheProvider.Search,
      );
      if (cached && cached.expiresAt > new Date()) {
        if (cached.httpStatus === 404) {
          return [];
        }
        return cached.rawResponse as unknown as AzVocabSearchResponseDto[];
      }

      // 2. Cache miss, call external API
      const url = `${this.baseUrl}/api/vocab/search?q=${encodeURIComponent(
        word,
      )}`;

      const { data } = await firstValueFrom(
        this.httpService.post<AzVocabSearchResponseDto[]>(url, null, {
          headers: this.buildHeaders(),
          timeout: this.timeout,
        }),
      );

      // 3. Async save search cache
      const results = data || [];
      this.saveSearchToCache(normalizedWord, results);

      return results;
    } catch (error) {
      if (
        error &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (error.code === 'ECONNABORTED' || error.name === 'TimeoutError')
      ) {
        this.logger.warn(`Timeout searching for word '${word}'`);
        throw new ServiceUnavailableException('Dictionary provider timeout');
      }
      this.handleError(error, `search word '${word}'`);
      return [];
    }
  }

  async getDefinitionById(
    defId: string,
  ): Promise<AzVocabDefinitionResponseDto | null> {
    if (!this.cookie || !this.buildId) {
      this.logger.warn(
        'AzVocab Cookie or BuildID not configured, skipping definition fetch',
      );
      return null;
    }

    try {
      // 1. Check definition cache first
      const cached = await this.cacheRepository.findByWord(
        defId,
        AzVocabCacheProvider.Definition,
      );
      if (cached && cached.expiresAt > new Date()) {
        return cached.rawResponse as unknown as AzVocabDefinitionResponseDto;
      }

      // 2. Cache miss, call external API
      // URL format: /_next/data/{buildId}/vi/definition/{defId}.json?id={defId}
      const url = `${this.baseUrl}/_next/data/${
        this.buildId
      }/vi/definition/${encodeURIComponent(defId)}.json`;

      const { data } = await firstValueFrom(
        this.httpService.get<AzVocabDefinitionResponseDto>(url, {
          headers: this.buildHeaders(),
          params: { id: encodeURIComponent(defId) },
          timeout: this.timeout,
        }),
      );

      // 3. Async save definition cache
      if (data) {
        this.saveDefinitionToCache(defId, data);
      }

      return data;
    } catch (error) {
      const err = error as { code?: string; name?: string; message?: string };
      if (
        err &&
        (err.code === 'ECONNABORTED' ||
          err.name === 'TimeoutError' ||
          err.message === 'Dictionary provider timeout exceeded 3000ms')
      ) {
        this.logger.warn(`Timeout fetching definition for ${defId}`);
        return null;
      }

      // Log warning but don't throw for missing definitions - partial data is acceptable
      const status = (error as { response?: { status?: number } }).response
        ?.status;
      if (status === 404) {
        return null;
      }
      this.logger.warn(
        `Failed to fetch definition '${defId}': ${(error as Error).message}`,
      );
      return null;
    }
  }

  private saveDefinitionToCache(
    defId: string,
    data: AzVocabDefinitionResponseDto,
  ): void {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days TTL

    const entity = new ProviderResponseCacheOrmEntity();
    entity.normalizedWord = defId;
    entity.provider = AzVocabCacheProvider.Definition;
    entity.rawResponse = data as unknown as Record<string, unknown>;
    entity.httpStatus = 200;
    entity.expiresAt = expiresAt;

    this.cacheRepository.saveAsync(entity).catch((err) => {
      this.logger.error(
        `Failed to save async definition cache for ${defId}`,
        (err as Error).stack,
      );
    });
  }

  private saveSearchToCache(
    word: string,
    data: AzVocabSearchResponseDto[],
  ): void {
    const expiresAt = new Date();
    // Use 90 days for results, or 1 day for empty results (404 logic)
    if (data.length === 0) {
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours for missing
    } else {
      expiresAt.setDate(expiresAt.getDate() + 90); // 90 days for found
    }

    const entity = new ProviderResponseCacheOrmEntity();
    entity.normalizedWord = word;
    entity.provider = AzVocabCacheProvider.Search;
    entity.rawResponse = data as unknown as Record<string, unknown>;
    entity.httpStatus = data.length === 0 ? 404 : 200;
    entity.expiresAt = expiresAt;

    this.cacheRepository.saveAsync(entity).catch((err) => {
      this.logger.error(
        `Failed to save async search cache for ${word}`,
        (err as Error).stack,
      );
    });
  }

  private handleError(error: unknown, context: string): void {
    const err = error as {
      response?: { status?: number };
      code?: string;
      name?: string;
    };
    if (err.response && err.response.status) {
      const status = err.response.status;
      if (status === 404) {
        return; // Return empty/null upstream
      }
      if (status === 429) {
        this.logger.warn(`AzVocab rate limit exceeded during ${context}`);
        throw new ServiceUnavailableException('Provider rate limit exceeded');
      }
      if (status >= 500) {
        this.logger.error(`AzVocab server error during ${context}: ${status}`);
        throw new ServiceUnavailableException('Provider server error');
      }
    }
    if (err.code === 'ECONNABORTED' || err.name === 'TimeoutError') {
      this.logger.warn(`AzVocab request timeout during ${context}`);
      throw new ServiceUnavailableException('Provider timeout');
    }
    this.logger.error(
      `AzVocab error during ${context}: ${(error as Error).message}`,
      (error as Error).stack,
    );
    throw new ServiceUnavailableException('Provider lookup failed');
  }
}
