import { Mapper } from '@core/ddd';
import { Injectable } from '@nestjs/common';
import { Tenant, TenantPlan, TenantStatus } from '../../domain/entities';
import { TenantOrmEntity } from '../persistence/tenant.orm-entity';

@Injectable()
export class TenantMapper implements Mapper<
  Tenant,
  TenantOrmEntity,
  TenantOrmEntity
> {
  toPersistence(entity: Tenant): TenantOrmEntity {
    const ormEntity = new TenantOrmEntity();
    ormEntity.id = entity.id;
    ormEntity.name = entity.name;
    ormEntity.status = entity.status as string;
    ormEntity.plan = entity.plan as string;
    ormEntity.createdAt = entity.createdAt;
    ormEntity.updatedAt = entity.updatedAt;
    return ormEntity;
  }

  toDomain(record: TenantOrmEntity): Tenant {
    return Tenant.rehydrate({
      id: record.id,
      name: record.name,
      status: record.status as TenantStatus,
      plan: record.plan as TenantPlan,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toResponse(entity: Tenant): TenantOrmEntity {
    return this.toPersistence(entity);
  }
}
