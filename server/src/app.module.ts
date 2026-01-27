import { Module } from '@nestjs/common';

import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [EventEmitterModule.forRoot(), CqrsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
