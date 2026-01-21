import {
  Entity,
  Enum,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { AccountType } from '../../domain/enums/account-type.enum';
import { UserMikroEntity } from './user.mikro-entity';

@Entity({ tableName: 'accounts' })
@Index({ properties: ['type', 'providerId'], name: 'idx_account_provider' })
@Index({ properties: ['type', 'email'], name: 'idx_account_type_email' })
export class AccountMikroEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => UserMikroEntity, { fieldName: 'user_id' })
  user!: UserMikroEntity;

  @Enum(() => AccountType)
  type!: AccountType;

  @Property({ fieldName: 'provider_id', nullable: true, length: 255 })
  providerId?: string;

  @Property({ length: 255 })
  email!: string;

  @Property({ fieldName: 'password_hash', nullable: true, length: 255 })
  passwordHash?: string;

  @Property({ fieldName: 'created_at' })
  createdAt: Date = new Date();

  @Property({ fieldName: 'updated_at', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
