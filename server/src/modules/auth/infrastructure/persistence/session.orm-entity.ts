import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { v4 } from 'uuid';

import { AuthIdentityOrmEntity } from './auth-identity.orm-entity';
import { TenantOrmEntity } from './tenant.orm-entity';
import { UserOrmEntity } from './user.orm-entity';

@Entity({ tableName: 'sessions' })
export class SessionOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => TenantOrmEntity)
  @Index()
  tenant!: TenantOrmEntity;

  @ManyToOne(() => UserOrmEntity)
  @Index()
  user!: UserOrmEntity;

  @ManyToOne(() => AuthIdentityOrmEntity, { nullable: true })
  authIdentity?: AuthIdentityOrmEntity;

  @Property({ nullable: true })
  refreshTokenHash?: string;

  @Property({ default: 'ACTIVE' })
  @Index()
  status!: string;

  @Property()
  @Index()
  expiresAt!: Date;

  @Property({ nullable: true })
  deviceId?: string;

  @Property({ nullable: true })
  ipAddress?: string;

  @Property({ nullable: true })
  userAgent?: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
