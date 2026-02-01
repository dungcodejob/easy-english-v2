import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ITenantRepository } from '../../domain/repositories/tenant.repository.interface';
import { TenantOrmEntity } from '../persistence/tenant.orm-entity';

@Injectable()
export class TenantRepository implements ITenantRepository {
  constructor(
    @InjectRepository(TenantOrmEntity)
    private readonly repo: EntityRepository<TenantOrmEntity>,
    private readonly em: EntityManager,
  ) {}

  create(tenant: TenantOrmEntity): TenantOrmEntity {
    this.em.persist(tenant);
    return tenant;
  }

  persist(tenant: TenantOrmEntity): void {
    this.em.persist(tenant);
  }
}
