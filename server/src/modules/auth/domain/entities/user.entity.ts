import { Account } from './account.entity';
import { Session } from './session.entity';

export class User {
  id: string;
  tenantId: string;
  name: string;
  username: string;
  email: string;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  accounts: Account[];
  sessions: Session[];

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
    this.accounts = this.accounts || [];
    this.sessions = this.sessions || [];
    this.tokenVersion = this.tokenVersion || 0;
  }
}
