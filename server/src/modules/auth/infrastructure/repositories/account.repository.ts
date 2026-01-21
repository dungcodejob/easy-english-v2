import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Account } from '../../domain/entities/account.entity';
import { AccountType } from '../../domain/enums/account-type.enum';
import { AccountMikroEntity } from '../persistence/account.mikro-entity';
import { UserMikroEntity } from '../persistence/user.mikro-entity';

@Injectable()
export class AccountRepository {
  constructor(
    @InjectRepository(AccountMikroEntity)
    private readonly repo: EntityRepository<AccountMikroEntity>,
  ) {}

  async create(account: Account): Promise<void> {
    const entity = this.repo.create({
      id: account.id,
      user: this.repo
        .getEntityManager()
        .getReference(UserMikroEntity, account.userId), // MikroORM sets FK by ID or ref
      type: account.type,
      providerId: account.providerId,
      email: account.email,
      passwordHash: account.passwordHash,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    });
    await this.repo.getEntityManager().persistAndFlush(entity);
  }

  async update(account: Account): Promise<void> {
    const entity = await this.repo.findOne({ id: account.id });
    if (entity) {
      entity.email = account.email;
      entity.passwordHash = account.passwordHash;
      entity.updatedAt = new Date();
      await this.repo.getEntityManager().flush();
    }
  }

  async findByUserIdAndType(
    userId: string,
    type: AccountType,
  ): Promise<Account | null> {
    const entity = await this.repo.findOne({ user: userId, type });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async findByProvider(
    type: AccountType,
    providerId: string,
  ): Promise<Account | null> {
    const entity = await this.repo.findOne({ type, providerId });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async findByUserId(userId: string): Promise<Account[]> {
    const entities = await this.repo.find({ user: userId });
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: string): Promise<Account | null> {
    const entity = await this.repo.findOne({ id });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async delete(id: string): Promise<void> {
    const entity = await this.repo.findOne({ id });
    if (entity) {
      await this.repo.getEntityManager().removeAndFlush(entity);
    }
  }

  private toDomain(entity: AccountMikroEntity): Account {
    return new Account({
      id: entity.id,
      userId: entity.user.id, // Assuming loaded or check if it's a reference
      type: entity.type, // Enum cast
      providerId: entity.providerId,
      email: entity.email,
      passwordHash: entity.passwordHash,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
