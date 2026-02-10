import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { dictionaryConfig } from '../../configs/dictionary.config';
import { ProviderResponseCacheOrmEntity } from './infrastructure/persistence/provider-response-cache.orm-entity';
import { WordExampleOrmEntity } from './infrastructure/persistence/word-example.orm-entity';
import { WordPronunciationOrmEntity } from './infrastructure/persistence/word-pronunciation.orm-entity';
import { WordSenseOrmEntity } from './infrastructure/persistence/word-sense.orm-entity';
import { WordOrmEntity } from './infrastructure/persistence/word.orm-entity';

import { LookupWordHandler } from './application/queries/lookup-word.handler';
import { LookupController } from './controllers/lookup.controller';
import { WORD_READ_REPOSITORY } from './domain/repositories/word-read.repository.interface';
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
      useFactory: async (configService: ConfigService) => ({
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
    {
      provide: WORD_READ_REPOSITORY,
      useClass: WordReadRepository,
    },
  ],
})
export class DictionaryModule {}
