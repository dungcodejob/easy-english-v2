import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AddToLearningHandler } from './application/commands/add-to-learning.handler';
import { RemoveFromLearningHandler } from './application/commands/remove-from-learning.handler';
import { GetLearningListHandler } from './application/queries/get-learning-list.handler';
import { GetLearningStateHandler } from './application/queries/get-learning-state.handler';
import { LearningController } from './controllers/learning.controller';
import { provideLearningReadRepository } from './domain/repositories/learning-read.repository.interface';
import { provideLearningWriteRepository } from './domain/repositories/learning-write.repository.interface';
import { UserWordSenseProgressOrmEntity } from './infrastructure/persistence/user-word-sense-progress.orm-entity';
import { LearningReadRepository } from './infrastructure/repositories/learning-read.repository';
import { LearningWriteRepository } from './infrastructure/repositories/learning-write.repository';

const repositories = [
  provideLearningReadRepository(LearningReadRepository),
  provideLearningWriteRepository(LearningWriteRepository),
];

const queryHandlers = [GetLearningStateHandler, GetLearningListHandler];
const commandHandlers = [AddToLearningHandler, RemoveFromLearningHandler];
const httpControllers = [LearningController];

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([UserWordSenseProgressOrmEntity]),
  ],
  controllers: [...httpControllers],
  providers: [...repositories, ...queryHandlers, ...commandHandlers],
  exports: [...repositories],
})
export class ProgressModule {}
