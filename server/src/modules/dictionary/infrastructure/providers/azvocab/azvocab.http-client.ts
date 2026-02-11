import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  AzVocabDefinitionResponseDto,
  AzVocabSearchResponseDto,
} from './azvocab.types';

@Injectable()
export class AzVocabHttpClient {
  private readonly logger = new Logger(AzVocabHttpClient.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private get baseUrl(): string {
    return (
      this.configService.get<string>('dictionary.azvocab.url') ||
      'https://azvocab.com'
    );
  }

  private get cookie(): string | undefined {
    return this.configService.get<string>('dictionary.azvocab.cookie');
  }

  private get buildId(): string | undefined {
    return this.configService.get<string>('dictionary.azvocab.buildId');
  }

  private get timeout(): number {
    return (
      this.configService.get<number>('dictionary.azvocab.timeoutMs') || 5000
    );
  }

  private get headers(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: '*/*',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
      const url = `${this.baseUrl}/api/vocab/search?q=${encodeURIComponent(
        word,
      )}`;

      const { data } = await firstValueFrom(
        this.httpService.post<AzVocabSearchResponseDto[]>(url, null, {
          headers: this.headers,
          timeout: this.timeout,
        }),
      );

      return data || [];
    } catch (error) {
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
      // URL format: /_next/data/{buildId}/vi/definition/{defId}.json?id={defId}
      const url = `${this.baseUrl}/_next/data/${
        this.buildId
      }/vi/definition/${encodeURIComponent(defId)}.json`;

      const { data } = await firstValueFrom(
        this.httpService.get<AzVocabDefinitionResponseDto>(url, {
          headers: {
            ...this.headers,
            'x-nextjs-data': '1',
          },
          params: { id: defId },
          timeout: this.timeout,
        }),
      );

      return data;
    } catch (error) {
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

  private handleError(error: unknown, context: string): void {
    const err = error as { response?: { status?: number } };
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
    this.logger.error(
      `AzVocab error during ${context}: ${(error as Error).message}`,
      (error as Error).stack,
    );
    throw new ServiceUnavailableException('Provider lookup failed');
  }
}
