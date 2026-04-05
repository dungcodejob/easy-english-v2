import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetWorkspaceQuery } from './get-workspace.query';
import {
  InjectWorkspaceRepository,
  type IWorkspaceRepository,
} from '../../domain/repositories/workspace.repository.interface';
import { WorkspaceResponseDto } from '../../dto/responses/workspace.response.dto';

@QueryHandler(GetWorkspaceQuery)
export class GetWorkspaceHandler implements IQueryHandler<
  GetWorkspaceQuery,
  WorkspaceResponseDto
> {
  constructor(
    @InjectWorkspaceRepository()
    private readonly workspaceRepo: IWorkspaceRepository,
  ) {}

  async execute(query: GetWorkspaceQuery): Promise<WorkspaceResponseDto> {
    const { id, userId } = query;
    const workspace = await this.workspaceRepo.findOneById(id);

    if (workspace?.userId !== userId) {
      throw new NotFoundException('Workspace not found');
    }

    return new WorkspaceResponseDto(
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
    );
  }
}
