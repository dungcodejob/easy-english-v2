import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { dictionaryConfig } from '../../configs/dictionary.config';
import { LookupMissedHandler } from './application/events/lookup-missed.handler';
import { LookupWordHandler } from './application/queries/lookup-word.handler';
import { LookupController } from './controllers/lookup.controller';
import { LOOKUP_PROVIDER } from './domain/providers/lookup-provider.interface';
import {
  IProviderCacheRepository,
  PROVIDER_CACHE_REPOSITORY,
} from './domain/repositories/provider-cache.repository.interface';
import { WORD_READ_REPOSITORY } from './domain/repositories/word-read.repository.interface';
import { ProviderResponseCacheOrmEntity } from './infrastructure/persistence/provider-response-cache.orm-entity';
import { WordExampleOrmEntity } from './infrastructure/persistence/word-example.orm-entity';
import { WordPronunciationOrmEntity } from './infrastructure/persistence/word-pronunciation.orm-entity';
import { WordSenseOrmEntity } from './infrastructure/persistence/word-sense.orm-entity';
import { WordOrmEntity } from './infrastructure/persistence/word.orm-entity';
import { AzVocabLookupProvider } from './infrastructure/providers/azvocab/azvocab.lookup-provider';
import { CachingProviderDecorator } from './infrastructure/providers/caching-provider.decorator';
import { ProviderCacheRepository } from './infrastructure/repositories/provider-cache.repository';
import { WordReadRepository } from './infrastructure/repositories/word-read.repository';

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
  controllers: [LookupController],
  providers: [
    LookupWordHandler,
    LookupMissedHandler,
    {
      provide: WORD_READ_REPOSITORY,
      useClass: WordReadRepository,
    },
    {
      provide: PROVIDER_CACHE_REPOSITORY,
      useClass: ProviderCacheRepository,
    },
    AzVocabLookupProvider,
    {
      provide: LOOKUP_PROVIDER,
      useFactory: (
        azvocab: AzVocabLookupProvider,
        cacheRepo: IProviderCacheRepository,
        configService: ConfigService,
      ) => {
        return new CachingProviderDecorator(azvocab, cacheRepo, configService);
      },
      inject: [AzVocabLookupProvider, PROVIDER_CACHE_REPOSITORY, ConfigService],
    },
  ],
})
export class DictionaryModule {}
