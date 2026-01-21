import { Account } from '../entities/account.entity';
import { AccountType } from '../enums/account-type.enum';

export interface IAccountRepository {
  create(account: Account): Promise<void>;
  update(account: Account): Promise<void>;
  findByUserIdAndType(
    userId: string,
    type: AccountType,
  ): Promise<Account | null>;
  findByProvider(
    type: AccountType,
    providerId: string,
  ): Promise<Account | null>;
  findByUserId(userId: string): Promise<Account[]>;
  findById(id: string): Promise<Account | null>;
  delete(id: string): Promise<void>;
}
