import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  InjectWorkspaceRepository,
  type IWorkspaceRepository,
} from '../../domain/repositories/workspace.repository.interface';
import { HasWorkspaceResponseDto } from '../../dto/responses/has-workspace.response.dto';
import { CheckHasWorkspaceQuery } from './check-has-workspace.query';

@QueryHandler(CheckHasWorkspaceQuery)
export class CheckHasWorkspaceHandler implements IQueryHandler<
  CheckHasWorkspaceQuery,
  HasWorkspaceResponseDto
> {
  constructor(
    @InjectWorkspaceRepository()
    private readonly workspaceRepo: IWorkspaceRepository,
  ) {}

  async execute(
    query: CheckHasWorkspaceQuery,
  ): Promise<HasWorkspaceResponseDto> {
    const { userId } = query;
    const workspace = await this.workspaceRepo.findOneByUserId(userId);
    return new HasWorkspaceResponseDto(!!workspace, workspace?.id);
  }
}
