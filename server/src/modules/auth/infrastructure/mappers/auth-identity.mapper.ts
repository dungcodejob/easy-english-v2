import { Injectable } from '@nestjs/common';

import { EntityManager } from '@mikro-orm/core';

import { Mapper } from '@core/ddd';

import { AuthIdentity, AuthProvider } from '../../domain/entities';
import { Password } from '../../domain/value-objects';
import { AuthIdentityOrmEntity } from '../persistence/auth-identity.orm-entity';
import { UserOrmEntity } from '../persistence/user.orm-entity';

@Injectable()
export class AuthIdentityMapper implements Mapper<
  AuthIdentity,
  AuthIdentityOrmEntity,
  AuthIdentityOrmEntity
> {
  constructor(private readonly em: EntityManager) {}

  toPersistence(entity: AuthIdentity): AuthIdentityOrmEntity {
    const ormEntity = new AuthIdentityOrmEntity();

    ormEntity.id = entity.id;
    ormEntity.user = this.em.getReference(UserOrmEntity, entity.userId);
    ormEntity.provider = entity.provider as string;
    ormEntity.providerUserId = entity.providerUserId;
    ormEntity.passwordHash = entity.password?.getHashedValue();
    ormEntity.createdAt = entity.createdAt;
    ormEntity.updatedAt = entity.updatedAt;

    return ormEntity;
  }

  toDomain(record: AuthIdentityOrmEntity): AuthIdentity {
    return AuthIdentity.rehydrate({
      id: record.id,
      userId: record.user.id,
      provider: record.provider as AuthProvider,
      providerUserId: record.providerUserId,
      password: record.passwordHash
        ? Password.create(record.passwordHash)
        : undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toResponse(entity: AuthIdentity): AuthIdentityOrmEntity {
    return this.toPersistence(entity);
  }
}
