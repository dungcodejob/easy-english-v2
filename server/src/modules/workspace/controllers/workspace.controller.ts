import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { CurrentUser } from '@shared/decorators/current-user.decorator';

import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { CreateWorkspaceCommand } from '../application/commands/create-workspace.command';
import { CheckHasWorkspaceQuery } from '../application/queries/check-has-workspace.query';
import { GetWorkspaceQuery } from '../application/queries/get-workspace.query';
import { ListWorkspacesQuery } from '../application/queries/list-workspaces.query';
import { CreateWorkspaceRequestDto } from '../dto/requests/create-workspace.request.dto';
import { HasWorkspaceResponseDto } from '../dto/responses/has-workspace.response.dto';
import { WorkspaceResponseDto } from '../dto/responses/workspace.response.dto';

import type { ITokenPayload } from '../../auth/domain/ports/token-generator.interface';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createWorkspace(
    @CurrentUser() user: ITokenPayload,
    @Body() dto: CreateWorkspaceRequestDto,
  ): Promise<WorkspaceResponseDto> {
    return this.commandBus.execute(
      new CreateWorkspaceCommand({
        ...dto,
        userId: user.userId,
        tenantId: user.tenantId,
      }),
    );
  }

  @Get()
  async findAll(
    @CurrentUser() user: ITokenPayload,
  ): Promise<WorkspaceResponseDto[]> {
    return this.queryBus.execute(new ListWorkspacesQuery(user.userId));
  }

  @Get('check')
  async checkHasWorkspace(
    @CurrentUser() user: ITokenPayload,
  ): Promise<HasWorkspaceResponseDto> {
    return this.queryBus.execute(new CheckHasWorkspaceQuery(user.userId));
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: ITokenPayload,
    @Param('id') id: string,
  ): Promise<WorkspaceResponseDto> {
    return this.queryBus.execute(new GetWorkspaceQuery(id, user.userId));
  }
}
