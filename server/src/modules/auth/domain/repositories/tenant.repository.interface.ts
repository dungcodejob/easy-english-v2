import { TenantOrmEntity } from '../../infrastructure/persistence/tenant.orm-entity';

export interface ITenantRepository {
  create(tenant: TenantOrmEntity): TenantOrmEntity;
  persist(tenant: TenantOrmEntity): void;
}
