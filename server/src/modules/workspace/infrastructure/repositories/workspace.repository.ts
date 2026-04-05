import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';

import { WorkspaceEntity } from '../../domain/entities/workspace.entity';
import { IWorkspaceRepository } from '../../domain/repositories/workspace.repository.interface';
import { WorkspaceMapper } from '../mappers/workspace.mapper';
import { WorkspaceOrmEntity } from '../persistence/workspace.orm-entity';

@Injectable()
export class WorkspaceRepository implements IWorkspaceRepository {
  constructor(
    @InjectRepository(WorkspaceOrmEntity)
    private readonly repo: EntityRepository<WorkspaceOrmEntity>,
    private readonly em: EntityManager,
    private readonly mapper: WorkspaceMapper,
  ) {}

  persist(workspace: WorkspaceEntity): void {
    const ormEntity = this.mapper.toPersistence(workspace);

    this.em.persist(ormEntity);
  }

  async findOneById(id: string): Promise<WorkspaceEntity | null> {
    const ormEntity = await this.repo.findOne({ id });

    return ormEntity ? this.mapper.toDomain(ormEntity) : null;
  }

  async findOneByName(name: string): Promise<WorkspaceEntity | null> {
    const ormEntity = await this.repo.findOne({ name });

    return ormEntity ? this.mapper.toDomain(ormEntity) : null;
  }

  async findOneByNameAndUserId(
    name: string,
    userId: string,
  ): Promise<WorkspaceEntity | null> {
    const ormEntity = await this.repo.findOne({ name, userId });

    return ormEntity ? this.mapper.toDomain(ormEntity) : null;
  }

  async findOneByUserId(userId: string): Promise<WorkspaceEntity | null> {
    const ormEntity = await this.repo.findOne({ userId });

    return ormEntity ? this.mapper.toDomain(ormEntity) : null;
  }

  async findAllByUserId(userId: string): Promise<WorkspaceEntity[]> {
    const ormEntities = await this.repo.find({ userId });

    return ormEntities.map((entity) => this.mapper.toDomain(entity));
  }

  async findOneByTenantId(tenantId: string): Promise<WorkspaceEntity | null> {
    const ormEntity = await this.repo.findOne({ tenantId });

    return ormEntity ? this.mapper.toDomain(ormEntity) : null;
  }
}
