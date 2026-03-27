import { Injectable } from '@nestjs/common';

import { EntityManager } from '@mikro-orm/core';

import { Mapper } from '@core/ddd';

import { User, UserRole } from '../../domain/entities';
import { Email, Username } from '../../domain/value-objects';
import { TenantOrmEntity } from '../persistence/tenant.orm-entity';
import { UserOrmEntity } from '../persistence/user.orm-entity';

@Injectable()
export class UserMapper implements Mapper<User, UserOrmEntity, UserOrmEntity> {
  constructor(private readonly em: EntityManager) {}

  toPersistence(entity: User): UserOrmEntity {
    const ormEntity = new UserOrmEntity();

    ormEntity.id = entity.id;
    ormEntity.tenant = this.em.getReference(TenantOrmEntity, entity.tenantId);
    ormEntity.email = entity.email.value;
    ormEntity.username = entity.username.value;
    ormEntity.name = entity.name;
    ormEntity.role = entity.role as string;
    ormEntity.createdAt = entity.createdAt;
    ormEntity.updatedAt = entity.updatedAt;

    return ormEntity;
  }

  toDomain(record: UserOrmEntity): User {
    return User.rehydrate({
      id: record.id,
      tenantId: record.tenant.id,
      email: Email.create(record.email),
      username: Username.create(record.username),
      name: record.name,
      role: record.role as UserRole,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toResponse(entity: User): UserOrmEntity {
    return this.toPersistence(entity);
  }
}
