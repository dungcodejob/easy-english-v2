import { Entity, Index, PrimaryKey, Property, Unique } from '@mikro-orm/core';

@Entity({ tableName: 'provider_response_cache' })
export class ProviderResponseCacheOrmEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ length: 100 })
  @Index()
  normalizedWord!: string;

  @Property({ length: 50 })
  provider!: string;

  @Property({ type: 'jsonb' })
  rawResponse!: Record<string, unknown>;

  @Property()
  httpStatus!: number;

  @Property()
  createdAt: Date = new Date();

  @Property()
  @Index()
  expiresAt!: Date;

  @Unique({ properties: ['normalizedWord', 'provider'] })
  uniqueWordProvider!: string;
}
