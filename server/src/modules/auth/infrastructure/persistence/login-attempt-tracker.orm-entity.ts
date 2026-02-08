import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { TenantOrmEntity } from './tenant.orm-entity';

@Entity({ tableName: 'login_attempt_trackers' })
@Index({ properties: ['tenant', 'identifier', 'identifierType'] })
export class LoginAttemptTrackerOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => TenantOrmEntity)
  tenant!: TenantOrmEntity;

  @Property()
  identifier!: string;

  @Property()
  identifierType!: string; // 'EMAIL' | 'IP'

  @Property({ default: 0 })
  attemptCount: number = 0;

  @Property()
  lastAttemptAt!: Date;

  @Property({ nullable: true })
  lockExpiresAt?: Date;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
