import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { dictionaryConfig } from '../../configs/dictionary.config';
import { LookupMissedHandler } from './application/events/lookup-missed.handler';
import { WordEnrichmentHandler } from './application/events/word-enrichment.handler';
import { WordPersistenceHandler } from './application/events/word-persistence.handler';
import { GetWordSenseDetailHandler } from './application/queries/get-word-sense-detail.handler';
import { LookupWordHandler } from './application/queries/lookup-word.handler';
import { SearchWordSensesHandler } from './application/queries/search-word-senses.handler';
import { DictionaryController } from './controllers/dictionary.controller';
import { lookupProviderToken } from './domain/providers/lookup-provider.interface';
import { provideProviderCacheRepository } from './domain/repositories/provider-cache.repository.interface';
import { provideWordReadRepository } from './domain/repositories/word-read.repository.interface';
import { provideWordWriteRepository } from './domain/repositories/word-write.repository.interface';
import { ProviderResponseCacheOrmEntity } from './infrastructure/persistence/provider-response-cache.orm-entity';
import { WordExampleOrmEntity } from './infrastructure/persistence/word-example.orm-entity';
import { WordPronunciationOrmEntity } from './infrastructure/persistence/word-pronunciation.orm-entity';
import { WordSenseOrmEntity } from './infrastructure/persistence/word-sense.orm-entity';
import { WordOrmEntity } from './infrastructure/persistence/word.orm-entity';
import { AzVocabAdapter } from './infrastructure/providers/azvocab/azvocab.adapter';
import { AzVocabHttpClient } from './infrastructure/providers/azvocab/azvocab.http-client';
import { AzVocabLookupProvider } from './infrastructure/providers/azvocab/azvocab.lookup-provider';
import { ProviderCacheRepository } from './infrastructure/repositories/provider-cache.repository';
import { WordReadRepository } from './infrastructure/repositories/word-read.repository';
import { WordWriteRepository } from './infrastructure/repositories/word-write.repository';

const httpControllers = [DictionaryController];
const messageControllers = [];
const commandHandlers = [];
const queryHandlers = [
  LookupWordHandler,
  SearchWordSensesHandler,
  GetWordSenseDetailHandler,
];
const eventHandlers = [
  LookupMissedHandler,
  WordPersistenceHandler,
  WordEnrichmentHandler,
];
const repositories = [
  provideWordWriteRepository(WordWriteRepository),
  provideWordReadRepository(WordReadRepository),
  provideProviderCacheRepository(ProviderCacheRepository),
];
const mappers = [];

@Module({
  imports: [
    CqrsModule,
    HttpModule,
    ConfigModule.forFeature(dictionaryConfig),
    MikroOrmModule.forFeature([
      ProviderResponseCacheOrmEntity,
      WordOrmEntity,
      WordSenseOrmEntity,
      WordPronunciationOrmEntity,
      WordExampleOrmEntity,
    ]),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ttl:
          (configService.get<number>('dictionary.cache.memoryTtlSeconds') ||
            300) * 1000,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [...httpControllers, ...messageControllers],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    ...eventHandlers,
    ...repositories,
    ...mappers,

    AzVocabHttpClient,
    AzVocabAdapter,
    AzVocabLookupProvider,

    {
      provide: lookupProviderToken,
      useClass: AzVocabLookupProvider,
    },
    // {
    //   provide: lookupProviderToken,
    //   useFactory: (
    //     azvocab: AzVocabLookupProvider,
    //     cacheRepo: IProviderCacheRepository,
    //     configService: ConfigService,
    //   ) => {
    //     return new CachingProviderDecorator(azvocab, cacheRepo, configService);
    //   },
    //   inject: [
    //     AzVocabLookupProvider,
    //     providerCacheRepositoryToken,
    //     ConfigService,
    //   ],
    // },
  ],
})
export class DictionaryModule {}
