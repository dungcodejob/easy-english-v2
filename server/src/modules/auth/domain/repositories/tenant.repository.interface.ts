import { createInjection } from '@shared/utils';
import { TenantOrmEntity } from '../../infrastructure/persistence/tenant.orm-entity';

export interface ITenantRepository {
  create(tenant: TenantOrmEntity): TenantOrmEntity;
  persist(tenant: TenantOrmEntity): void;
}

const { inject, provider, token } =
  createInjection<ITenantRepository>('ITenantRepository');

export const injectTenantRepository = inject;
export const tenantRepositoryProvider = provider;
export const tenantRepositoryToken = token;
