import { createInjection } from '@shared/utils';
import { WorkspaceEntity } from '../entities/workspace.entity';

export interface IWorkspaceRepository {
  persist(workspace: WorkspaceEntity): void;
  findOneById(id: string): Promise<WorkspaceEntity | null>;
  findOneByName(name: string): Promise<WorkspaceEntity | null>;
  findOneByNameAndUserId(
    name: string,
    userId: string,
  ): Promise<WorkspaceEntity | null>;
  findOneByUserId(userId: string): Promise<WorkspaceEntity | null>;
  findAllByUserId(userId: string): Promise<WorkspaceEntity[]>;
  findOneByTenantId(tenantId: string): Promise<WorkspaceEntity | null>;
}

const { inject, provider, token } = createInjection<IWorkspaceRepository>(
  'IWorkspaceRepository',
);

export const InjectWorkspaceRepository = inject;
export const provideWorkspaceRepository = provider;
export const workspaceRepositoryToken = token;
