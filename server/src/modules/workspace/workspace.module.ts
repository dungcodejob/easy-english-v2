import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { provideWorkspaceRepository } from './domain/repositories/workspace.repository.interface';
import { WorkspaceMapper } from './infrastructure/mappers/workspace.mapper';
import { WorkspaceOrmEntity } from './infrastructure/persistence/workspace.orm-entity';
import { WorkspaceRepository } from './infrastructure/repositories/workspace.repository';

import { CreateWorkspaceHandler } from './application/commands/create-workspace.handler';
import { CheckHasWorkspaceHandler } from './application/queries/check-has-workspace.handler';
import { WorkspaceController } from './controllers/workspace.controller';

const httpControllers = [WorkspaceController];
const messageControllers = [];
const commandHandlers = [CreateWorkspaceHandler];
const queryHandlers = [CheckHasWorkspaceHandler];
const eventHandlers = [];

@Module({
  imports: [MikroOrmModule.forFeature([WorkspaceOrmEntity]), CqrsModule],
  controllers: [...httpControllers, ...messageControllers],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    ...eventHandlers,
    WorkspaceMapper,
    provideWorkspaceRepository(WorkspaceRepository),
  ],
  exports: [provideWorkspaceRepository(WorkspaceRepository)],
})
export class WorkspaceModule {}
