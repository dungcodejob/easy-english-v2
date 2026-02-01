import { v4 } from 'uuid';
import { AggregateRoot } from '../../../../core/ddd/aggregate-root.base';
import { CreateEntityProps } from '../../../../core/ddd/entity.base';
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
  protected _id: string;

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
    const id = v4();
    const props: CreateEntityProps<UserProps> = {
      id,
      ...create,
      role: create.role || UserRole.MEMBER,
    };
    return new User(props);
  }
}
