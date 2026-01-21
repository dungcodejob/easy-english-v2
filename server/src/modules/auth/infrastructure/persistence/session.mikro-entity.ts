import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { UserMikroEntity } from './user.mikro-entity';

@Entity({ tableName: 'sessions' })
export class SessionMikroEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => UserMikroEntity, { fieldName: 'user_id' })
  user!: UserMikroEntity;

  @Property({ fieldName: 'refresh_token_hash', length: 255 })
  refreshTokenHash!: string;

  @Property({ length: 255 })
  identifier!: string;

  @Property({ fieldName: 'user_ip', length: 45 })
  userIp!: string;

  @Property({ fieldName: 'expires_at' })
  expiresAt!: Date;

  @Property({ fieldName: 'revoked_at', nullable: true })
  revokedAt?: Date;

  @Property({ fieldName: 'created_at' })
  createdAt: Date = new Date();

  @Property({ fieldName: 'last_activity_at' })
  lastActivityAt: Date = new Date();

  @Property({ fieldName: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
