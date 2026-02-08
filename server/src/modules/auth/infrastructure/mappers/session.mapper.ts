import { Mapper } from '@core/ddd';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Session, SessionStatus } from '../../domain/entities/session.entity';
import { AuthIdentityOrmEntity } from '../../infrastructure/persistence/auth-identity.orm-entity';
import { SessionOrmEntity } from '../../infrastructure/persistence/session.orm-entity';
import { TenantOrmEntity } from '../../infrastructure/persistence/tenant.orm-entity';
import { UserOrmEntity } from '../../infrastructure/persistence/user.orm-entity';

@Injectable()
export class SessionMapper implements Mapper<
  Session,
  SessionOrmEntity,
  SessionOrmEntity
> {
  constructor(private readonly em: EntityManager) {}

  toPersistence(entity: Session): SessionOrmEntity {
    const ormEntity = new SessionOrmEntity();
    ormEntity.id = entity.id;
    ormEntity.tenant = this.em.getReference(TenantOrmEntity, entity.tenantId);
    ormEntity.user = this.em.getReference(UserOrmEntity, entity.userId);
    ormEntity.authIdentity = entity.authIdentityId
      ? this.em.getReference(AuthIdentityOrmEntity, entity.authIdentityId)
      : undefined;
    ormEntity.refreshTokenHash = entity.refreshTokenHash;
    ormEntity.status = entity.status;
    ormEntity.expiresAt = entity.expiresAt;
    ormEntity.deviceId = entity.deviceId;
    ormEntity.ipAddress = entity.ipAddress;
    ormEntity.userAgent = entity.userAgent;
    ormEntity.createdAt = entity.createdAt;
    ormEntity.updatedAt = entity.updatedAt;
    return ormEntity;
  }

  toDomain(record: SessionOrmEntity): Session {
    const entity = Session.rehydrate({
      id: record.id,
      tenantId: record.tenant.id,
      userId: record.user.id,
      authIdentityId: record.authIdentity?.id,
      refreshTokenHash: record.refreshTokenHash,
      status: record.status as SessionStatus,
      expiresAt: record.expiresAt,
      deviceId: record.deviceId,
      ipAddress: record.ipAddress,
      userAgent: record.userAgent,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
    return entity;
  }

  toResponse(entity: Session): SessionOrmEntity {
    return this.toPersistence(entity);
  }
}
