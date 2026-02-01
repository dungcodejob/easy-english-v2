import { AggregateRoot, CreateEntityProps } from '@core/ddd';
import { v4 } from 'uuid';
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
  protected _id: string;

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
    const id = v4();
    const props: CreateEntityProps<TenantProps> = {
      id,
      name: create.name,
      status: TenantStatus.ACTIVE,
      plan: TenantPlan.FREE,
    };
    return new Tenant(props);
  }

  /**
   * Emit TenantCreatedEvent after successful creation
   */
  registerEvent(): void {
    this.addEvent(
      new TenantCreatedEvent({
        aggregateId: this.id,
        tenantId: this.id,
        name: this.name,
        plan: this.plan,
        status: this.status,
      }),
    );
  }
}
