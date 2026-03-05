import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { appConfig, httpConfig } from './configs';
import databaseConfig from './configs/database.config';
import { dictionaryConfig } from './configs/dictionary.config';
import { jwtConfig } from './configs/jwt.config';
import { AuthModule } from './modules/auth/auth.module';
import { DictionaryModule } from './modules/dictionary/dictionary.module';
import { LearningModule } from './modules/learning/learning.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      load: [appConfig, httpConfig, jwtConfig, dictionaryConfig],
      isGlobal: true,
    }),
    MikroOrmModule.forRoot(databaseConfig),
    CqrsModule,
    AuthModule,
    WorkspaceModule,
    DictionaryModule,
    LearningModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
