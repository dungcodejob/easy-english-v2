import { createInjection } from '@shared/utils';
import { Tenant } from '../entities';

export interface ITenantRepository {
  persist(tenant: Tenant): void;
}

const { inject, provider, token } =
  createInjection<ITenantRepository>('ITenantRepository');

export const injectTenantRepository = inject;
export const tenantRepositoryProvider = provider;
export const tenantRepositoryToken = token;
