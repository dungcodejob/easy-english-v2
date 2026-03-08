import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { appConfig, AppConfig, httpConfig } from './configs';
import databaseConfig from './configs/database.config';
import { dictionaryConfig } from './configs/dictionary.config';
import { jwtConfig } from './configs/jwt.config';
import { AuthModule } from './modules/auth/auth.module';
import { DictionaryModule } from './modules/dictionary/dictionary.module';

import { ProgressModule } from './modules/learning/progress/progress.module';
import { TopicModule } from './modules/learning/topic/topic.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      load: [appConfig, httpConfig, jwtConfig, dictionaryConfig],
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      inject: [appConfig.KEY],
      useFactory: (config: AppConfig) => [
        {
          ttl: config.throttlerTtl,
          limit: config.throttlerLimit,
        },
      ],
    }),
    MikroOrmModule.forRoot(databaseConfig),
    CqrsModule,
    AuthModule,
    WorkspaceModule,
    DictionaryModule,
    ProgressModule,
    TopicModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
