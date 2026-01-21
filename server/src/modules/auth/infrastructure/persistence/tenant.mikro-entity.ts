import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';

@Entity({ tableName: 'tenants' })
export class TenantMikroEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ length: 100 })
  name!: string;

  @Unique()
  @Property({ length: 50 })
  slug!: string;

  @Property({ fieldName: 'created_at' })
  createdAt: Date = new Date();
}
