import { UserOrmEntity } from '../../infrastructure/persistence/user.orm-entity';

export interface IUserRepository {
  create(user: UserOrmEntity): UserOrmEntity;
  persist(user: UserOrmEntity): void;
  findByEmail(email: string): Promise<UserOrmEntity | null>;
}
