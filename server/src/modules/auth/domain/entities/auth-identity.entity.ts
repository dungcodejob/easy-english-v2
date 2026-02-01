import { v4 } from 'uuid';
import { AggregateRoot } from '../../../../core/ddd/aggregate-root.base';
import { CreateEntityProps } from '../../../../core/ddd/entity.base';
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
  protected _id: string;

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
    const id = v4();
    const props: CreateEntityProps<AuthIdentityProps> = {
      id,
      ...create,
    };
    return new AuthIdentity(props);
  }
}
