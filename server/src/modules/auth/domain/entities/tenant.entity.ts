import { AggregateRoot, CreateEntityProps } from '@core/ddd';
import { v7 } from 'uuid';
import { TenantCreatedEvent } from '../events';

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum TenantPlan {
  FREE = 'FREE',
  PRO = 'PRO',
}

export interface TenantProps {
  name: string;
  status: TenantStatus;
  plan: TenantPlan;
}

export class Tenant extends AggregateRoot {
  // _id is inherited from Entity base class - do not redeclare!

  public name: string;
  public status: TenantStatus;
  public plan: TenantPlan;

  private constructor(props: CreateEntityProps<TenantProps>) {
    super({
      ...props,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    });
    this.name = props.name;
    this.status = props.status;
    this.plan = props.plan;
  }

  static create(create: Omit<TenantProps, 'status' | 'plan'>): Tenant {
    const id = v7();
    const props: CreateEntityProps<TenantProps> = {
      id,
      name: create.name,
      status: TenantStatus.ACTIVE,
      plan: TenantPlan.FREE,
    };

    const tenant = new Tenant(props);

    tenant.addEvent(
      new TenantCreatedEvent({
        aggregateId: tenant.id,
        tenantId: tenant.id,
        name: tenant.name,
        plan: tenant.plan,
        status: tenant.status,
      }),
    );
    return tenant;
  }

  static rehydrate(props: CreateEntityProps<TenantProps>): Tenant {
    return new Tenant(props);
  }
}
