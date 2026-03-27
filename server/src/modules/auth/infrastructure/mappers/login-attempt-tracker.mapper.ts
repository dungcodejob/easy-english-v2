import { Injectable } from '@nestjs/common';

import { EntityManager } from '@mikro-orm/core';

import { Mapper } from '@core/ddd';

import {
  IdentifierType,
  LoginAttemptTracker,
} from '../../domain/entities/login-attempt-tracker.entity';
import { LoginAttemptTrackerOrmEntity } from '../../infrastructure/persistence/login-attempt-tracker.orm-entity';
import { TenantOrmEntity } from '../../infrastructure/persistence/tenant.orm-entity';

@Injectable()
export class LoginAttemptTrackerMapper implements Mapper<
  LoginAttemptTracker,
  LoginAttemptTrackerOrmEntity,
  LoginAttemptTrackerOrmEntity
> {
  constructor(private readonly em: EntityManager) {}

  toPersistence(entity: LoginAttemptTracker): LoginAttemptTrackerOrmEntity {
    const ormEntity = new LoginAttemptTrackerOrmEntity();

    ormEntity.id = entity.id;
    ormEntity.tenant = this.em.getReference(TenantOrmEntity, entity.tenantId);
    ormEntity.identifier = entity.identifier;
    ormEntity.identifierType = entity.identifierType;
    ormEntity.attemptCount = entity.attemptCount;
    ormEntity.lastAttemptAt = entity.lastAttemptAt;
    ormEntity.lockExpiresAt = entity.lockExpiresAt;
    ormEntity.createdAt = entity.createdAt;
    ormEntity.updatedAt = entity.updatedAt;

    return ormEntity;
  }

  toDomain(record: LoginAttemptTrackerOrmEntity): LoginAttemptTracker {
    return LoginAttemptTracker.rehydrate({
      id: record.id,
      tenantId: record.tenant.id,
      identifier: record.identifier,
      identifierType: record.identifierType as IdentifierType,
      attemptCount: record.attemptCount,
      lastAttemptAt: record.lastAttemptAt,
      lockExpiresAt: record.lockExpiresAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toResponse(entity: LoginAttemptTracker): LoginAttemptTrackerOrmEntity {
    return this.toPersistence(entity);
  }
}
