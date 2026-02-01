import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [EventEmitterModule.forRoot(), CqrsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
