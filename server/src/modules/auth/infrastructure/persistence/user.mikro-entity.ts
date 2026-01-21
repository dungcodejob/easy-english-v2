import {
  Collection,
  Entity,
  Index,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { AccountMikroEntity } from './account.mikro-entity';
import { SessionMikroEntity } from './session.mikro-entity';

@Entity({ tableName: 'users' })
export class UserMikroEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Index()
  @Property({ type: 'uuid', fieldName: 'tenant_id' })
  tenantId!: string;

  @Property({ length: 100 })
  name!: string;

  @Unique()
  @Index()
  @Property({ length: 50 })
  username!: string;

  @Unique()
  @Index()
  @Property({ length: 255 })
  email!: string;

  @Property({ type: 'integer', fieldName: 'token_version', default: 0 })
  tokenVersion: number = 0;

  @Property({ fieldName: 'created_at' })
  createdAt: Date = new Date();

  @Property({ fieldName: 'updated_at', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ fieldName: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @OneToMany(() => AccountMikroEntity, (account) => account.user)
  accounts = new Collection<AccountMikroEntity>(this);

  @OneToMany(() => SessionMikroEntity, (session) => session.user)
  sessions = new Collection<SessionMikroEntity>(this);
}
