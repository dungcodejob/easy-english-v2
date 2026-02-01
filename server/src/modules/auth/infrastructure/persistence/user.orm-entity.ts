import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { TenantOrmEntity } from './tenant.orm-entity';

@Entity({ tableName: 'users' })
export class UserOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => TenantOrmEntity)
  @Index()
  tenant!: TenantOrmEntity;

  @Property()
  @Index()
  email!: string;

  @Property()
  name!: string;

  @Property({ unique: true })
  username!: string;

  @Property({ default: 'MEMBER' })
  role: string = 'MEMBER';

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
