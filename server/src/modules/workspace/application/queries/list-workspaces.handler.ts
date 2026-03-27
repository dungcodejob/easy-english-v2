import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ListWorkspacesQuery } from './list-workspaces.query';
import {
  InjectWorkspaceRepository,
  type IWorkspaceRepository,
} from '../../domain/repositories/workspace.repository.interface';
import { WorkspaceResponseDto } from '../../dto/responses/workspace.response.dto';

@QueryHandler(ListWorkspacesQuery)
export class ListWorkspacesHandler implements IQueryHandler<
  ListWorkspacesQuery,
  WorkspaceResponseDto[]
> {
  constructor(
    @InjectWorkspaceRepository()
    private readonly workspaceRepo: IWorkspaceRepository,
  ) {}

  async execute(query: ListWorkspacesQuery): Promise<WorkspaceResponseDto[]> {
    const { userId } = query;
    const workspaces = await this.workspaceRepo.findAllByUserId(userId);

    return workspaces.map(
      (workspace) =>
        new WorkspaceResponseDto(
          workspace.id,
          workspace.name,
          workspace.description,
          workspace.type,
          workspace.language,
          workspace.learningGoal,
          workspace.level,
          workspace.dailyTarget,
          workspace.studyReminder,
          workspace.defaultLearningMode,
          workspace.createdAt.toISOString(),
          workspace.updatedAt.toISOString(),
        ),
    );
  }
}
