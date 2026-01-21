import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserMikroEntity } from '../persistence/user.mikro-entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserMikroEntity)
    private readonly repo: EntityRepository<UserMikroEntity>,
  ) {}

  async create(user: User): Promise<void> {
    const entity = this.repo.create({
      id: user.id,
      tenantId: user.tenantId,
      name: user.name,
      username: user.username,
      email: user.email,
      tokenVersion: user.tokenVersion,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    });
    await this.repo.getEntityManager().persistAndFlush(entity);
  }

  async update(user: User): Promise<void> {
    const entity = await this.repo.findOne({ id: user.id });
    if (entity) {
      entity.name = user.name;
      entity.username = user.username;
      entity.email = user.email;
      entity.tokenVersion = user.tokenVersion;
      entity.updatedAt = new Date();
      // deletedAt, etc.
      await this.repo.getEntityManager().flush();
    }
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repo.findOne({ id, deletedAt: null });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repo.findOne({ email, deletedAt: null });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async findByUsername(username: string): Promise<User | null> {
    const entity = await this.repo.findOne({ username, deletedAt: null });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  private toDomain(entity: UserMikroEntity): User {
    return new User({
      id: entity.id,
      tenantId: entity.tenantId,
      name: entity.name,
      username: entity.username,
      email: entity.email,
      tokenVersion: entity.tokenVersion,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    });
  }
}
