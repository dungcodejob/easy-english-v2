import { AccountType } from '../enums/account-type.enum';

export class Account {
  id: string;
  userId: string;
  type: AccountType;
  providerId?: string; // Null for LOCAL
  email: string;
  passwordHash?: string; // Null for OAuth
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Account>) {
    Object.assign(this, partial);
  }
}
