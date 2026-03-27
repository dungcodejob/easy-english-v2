import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';

import { Tenant } from '../../domain/entities';
import { ITenantRepository } from '../../domain/repositories/tenant.repository.interface';
import { TenantMapper } from '../mappers/tenant.mapper';
import { TenantOrmEntity } from '../persistence/tenant.orm-entity';

@Injectable()
export class TenantRepository implements ITenantRepository {
  constructor(
    @InjectRepository(TenantOrmEntity)
    private readonly repo: EntityRepository<TenantOrmEntity>,
    private readonly em: EntityManager,
    private readonly mapper: TenantMapper,
  ) {}

  persist(tenant: Tenant): void {
    const ormEntity = this.mapper.toPersistence(tenant);

    this.em.persist(ormEntity);
  }
}
