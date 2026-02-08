import { EntityManager } from '@mikro-orm/core';
import { ConflictException, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { WorkspaceEntity } from '../../domain/entities/workspace.entity';
import {
  InjectWorkspaceRepository,
  type IWorkspaceRepository,
} from '../../domain/repositories/workspace.repository.interface';
import { WorkspaceResponseDto } from '../../dto/responses/workspace.response.dto';
import { CreateWorkspaceCommand } from './create-workspace.command';

@CommandHandler(CreateWorkspaceCommand)
export class CreateWorkspaceHandler implements ICommandHandler<
  CreateWorkspaceCommand,
  WorkspaceResponseDto
> {
  private readonly logger = new Logger(CreateWorkspaceHandler.name);

  constructor(
    @InjectWorkspaceRepository()
    private readonly workspaceRepo: IWorkspaceRepository,
    private readonly em: EntityManager,
  ) {}

  async execute(
    command: CreateWorkspaceCommand,
  ): Promise<WorkspaceResponseDto> {
    const {
      tenantId,
      userId,
      name,
      description,
      type,
      language,
      learningGoal,
      level,
      dailyTarget,
      studyReminder,
      defaultLearningMode,
    } = command;

    const existing = await this.workspaceRepo.findOneByNameAndUserId(
      name,
      userId,
    );
    if (existing) {
      throw new ConflictException('Workspace with this name already exists');
    }

    const workspace = WorkspaceEntity.create({
      tenantId,
      userId,
      name,
      description,
      type,
      language,
      learningGoal,
      level,
      dailyTarget,
      studyReminder,
      defaultLearningMode,
    });

    this.workspaceRepo.persist(workspace);
    await this.em.flush();

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
