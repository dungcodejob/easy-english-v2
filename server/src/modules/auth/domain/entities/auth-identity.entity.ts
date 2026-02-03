import { v7 } from 'uuid';

import { AggregateRoot, CreateEntityProps } from '@core/ddd';
import { AuthIdentityCreatedEvent } from '../events';
import { Password } from '../value-objects/password.vo';

export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
}

export interface AuthIdentityProps {
  userId: string;
  provider: AuthProvider;
  providerUserId: string; // email for LOCAL, sub for GOOGLE
  password?: Password;
}

export class AuthIdentity extends AggregateRoot {
  // _id is inherited from Entity base class - do not redeclare!

  public userId: string;
  public provider: AuthProvider;
  public providerUserId: string;
  public password?: Password;

  private constructor(props: CreateEntityProps<AuthIdentityProps>) {
    super({
      ...props,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    });
    this.userId = props.userId;
    this.provider = props.provider;
    this.providerUserId = props.providerUserId;
    this.password = props.password;
  }

  static create(create: AuthIdentityProps): AuthIdentity {
    const id = v7();
    const props: CreateEntityProps<AuthIdentityProps> = {
      id,
      ...create,
    };
    const authIdentity = new AuthIdentity(props);
    authIdentity.addEvent(
      new AuthIdentityCreatedEvent({
        aggregateId: authIdentity.id,
        authIdentityId: authIdentity.id,
        userId: authIdentity.userId,
        provider: authIdentity.provider,
        providerUserId: authIdentity.providerUserId,
      }),
    );
    return authIdentity;
  }

  static rehydrate(props: CreateEntityProps<AuthIdentityProps>): AuthIdentity {
    return new AuthIdentity(props);
  }
}
