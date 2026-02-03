import { v7 } from 'uuid';

import { AggregateRoot, CreateEntityProps } from '@core/ddd';
import { UserRegisteredEvent } from '../events';
import { Email } from '../value-objects/email.vo';
import { Username } from '../value-objects/username.vo';

export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface UserProps {
  tenantId: string;
  email: Email;
  username: Username;
  name: string;
  role: UserRole;
}

export class User extends AggregateRoot {
  // _id is inherited from Entity base class - do not redeclare!

  public tenantId: string;
  public email: Email;
  public username: Username;
  public name: string;
  public role: UserRole;

  private constructor(props: CreateEntityProps<UserProps>) {
    super({
      ...props,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    });
    this.tenantId = props.tenantId;
    this.email = props.email;
    this.username = props.username;
    this.name = props.name;
    this.role = props.role;
  }

  static create(create: Omit<UserProps, 'role'> & { role?: UserRole }): User {
    const id = v7();
    const props: CreateEntityProps<UserProps> = {
      id,
      ...create,
      role: create.role || UserRole.MEMBER,
    };

    const user = new User(props);
    user.addEvent(
      new UserRegisteredEvent({
        aggregateId: user.id,
        userId: user.id,
        email: user.email.value,
        tenantId: user.tenantId,
        name: user.name,
      }),
    );
    return user;
  }

  static rehydrate(props: CreateEntityProps<UserProps>): User {
    return new User(props);
  }
}
