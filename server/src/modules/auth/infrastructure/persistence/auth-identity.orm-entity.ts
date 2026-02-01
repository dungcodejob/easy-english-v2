import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { UserOrmEntity } from './user.orm-entity';

@Entity({ tableName: 'auth_identities' })
@Unique({ properties: ['provider', 'providerUserId'] })
export class AuthIdentityOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => UserOrmEntity)
  @Index()
  user!: UserOrmEntity;

  @Property()
  provider!: string;

  @Property()
  providerUserId!: string;

  @Property({ nullable: true })
  passwordHash?: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
