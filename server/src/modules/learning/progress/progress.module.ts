import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { AddToLearningHandler } from './application/commands/add-to-learning.handler';
import { RemoveFromLearningHandler } from './application/commands/remove-from-learning.handler';
import { ReviewWordHandler } from './application/commands/review-word.handler';
import { GetLearningListHandler } from './application/queries/get-learning-list.handler';
import { GetLearningStateHandler } from './application/queries/get-learning-state.handler';
import { provideLearningReadRepository } from './application/repositories/learning-read.repository.interface';
import { provideLearningWriteRepository } from './application/repositories/learning-write.repository.interface';
import { SensesController } from './controllers/senses.controller';
import { FsrsSchedulerService } from './domain/services/fsrs-scheduler.service';
import { UserWordSenseProgressOrmEntity } from './infrastructure/persistence/user-word-sense-progress.orm-entity';
import { LearningReadRepository } from './infrastructure/repositories/learning-read.repository';
import { LearningWriteRepository } from './infrastructure/repositories/learning-write.repository';

const repositories = [
  provideLearningReadRepository(LearningReadRepository),
  provideLearningWriteRepository(LearningWriteRepository),
];

const queryHandlers = [GetLearningStateHandler, GetLearningListHandler];
const commandHandlers = [
  AddToLearningHandler,
  RemoveFromLearningHandler,
  ReviewWordHandler,
];
const httpControllers = [SensesController];
const services = [FsrsSchedulerService];

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([UserWordSenseProgressOrmEntity]),
  ],
  controllers: [...httpControllers],
  providers: [
    ...repositories,
    ...services,
    ...queryHandlers,
    ...commandHandlers,
  ],
  exports: [...repositories, ...services],
})
export class ProgressModule {}
