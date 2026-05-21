import { createInjection } from '@shared/utils';

import { type Tenant } from '../../domain/entities';

export interface ITenantRepository {
  persist(tenant: Tenant): void;
}

const { inject, provider, token } =
  createInjection<ITenantRepository>('ITenantRepository');

export const injectTenantRepository = inject;
export const provideTenantRepository = provider;
export const tenantRepositoryToken = token;
