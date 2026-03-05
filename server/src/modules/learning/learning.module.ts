import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AddToLearningHandler } from './application/commands/add-to-learning.handler';
import { RemoveFromLearningHandler } from './application/commands/remove-from-learning.handler';
import { GetLearningStateHandler } from './application/queries/get-learning-state.handler';
import { LearningController } from './controllers/learning.controller';
import { provideLearningRepository } from './domain/repositories/learning.repository.interface';
import { UserWordSenseProgressOrmEntity } from './infrastructure/persistence/user-word-sense-progress.orm-entity';
import { LearningRepository } from './infrastructure/repositories/learning.repository';

const repositories = [provideLearningRepository(LearningRepository)];

const queryHandlers = [GetLearningStateHandler];
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
export class LearningModule {}
