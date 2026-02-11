import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  ILookupProvider,
  LookupResult,
} from '../../../domain/providers/lookup-provider.interface';
import { WordSnapshot } from '../../../domain/value-objects/word-snapshot.vo';
import {
  AzVocabResponseMapper,
  AzVocabSearchResponseDto,
} from './azvocab-response.mapper';

@Injectable()
export class AzVocabLookupProvider implements ILookupProvider {
  readonly name = 'azvocab';
  private readonly logger = new Logger(AzVocabLookupProvider.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  mapResponse(raw: any): WordSnapshot | null {
    try {
      return AzVocabResponseMapper.toDomain(raw as AzVocabSearchResponseDto);
    } catch (error) {
      this.logger.error(
        `Failed to map raw response: ${(error as Error).message}`,
      );
      return null;
    }
  }

  async lookup(word: string): Promise<LookupResult> {
    const baseUrl = this.configService.get<string>('dictionary.azvocab.url');
    const apiKey = this.configService.get<string>('dictionary.azvocab.apiKey');
    const timeout =
      this.configService.get<number>('dictionary.azvocab.timeoutMs') || 5000;

    if (!baseUrl || !apiKey) {
      this.logger.error('AzVocab API URL or Key not configured');
      throw new ServiceUnavailableException('Dictionary provider unavailable');
    }

    try {
      const { data, status } = await firstValueFrom(
        this.httpService.get<AzVocabSearchResponseDto>(
          `${baseUrl}/words/${word}`,
          {
            headers: { Authorization: `Bearer ${apiKey}` },
            timeout,
          },
        ),
      );

      return {
        snapshot: this.mapResponse(data),
        raw: data,
        status,
      };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      if (err.response) {
        if (err.response.status === 404) {
          return {
            snapshot: null,
            raw: err.response.data || {},
            status: 404,
          };
        }
        if (err.response.status === 429) {
          this.logger.warn(`AzVocab rate limit exceeded for word '${word}'`);
          throw new ServiceUnavailableException('Provider rate limit exceeded');
        }
        if (err.response.status && err.response.status >= 500) {
          this.logger.error(
            `AzVocab server error for word '${word}': ${err.response.status}`,
          );
          throw new ServiceUnavailableException('Provider server error');
        }
      }
      this.logger.error(
        `AzVocab lookup failed for word '${word}': ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new ServiceUnavailableException('Provider lookup failed');
    }
  }

  isAvailable(): Promise<boolean> {
    const baseUrl = this.configService.get<string>('dictionary.azvocab.url');
    return Promise.resolve(!!baseUrl);
  }
}
