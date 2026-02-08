import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import type { ITokenPayload } from '../../auth/domain/ports/token-generator.interface';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { CreateWorkspaceCommand } from '../application/commands/create-workspace.command';
import { CheckHasWorkspaceQuery } from '../application/queries/check-has-workspace.query';
import { CreateWorkspaceRequestDto } from '../dto/requests/create-workspace.request.dto';
import { HasWorkspaceResponseDto } from '../dto/responses/has-workspace.response.dto';
import { WorkspaceResponseDto } from '../dto/responses/workspace.response.dto';

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

  @Get('check')
  async checkHasWorkspace(
    @CurrentUser() user: ITokenPayload,
  ): Promise<HasWorkspaceResponseDto> {
    return this.queryBus.execute(new CheckHasWorkspaceQuery(user.userId));
  }
}
