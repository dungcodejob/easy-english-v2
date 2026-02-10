import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { dictionaryConfig } from '../../configs/dictionary.config';
import { ProviderResponseCacheOrmEntity } from './infrastructure/persistence/provider-response-cache.orm-entity';

@Module({
  imports: [
    CqrsModule,
    HttpModule,
    ConfigModule.forFeature(dictionaryConfig),
    MikroOrmModule.forFeature([ProviderResponseCacheOrmEntity]),
  ],
  providers: [],
  controllers: [],
  exports: [],
})
export class DictionaryModule {}
