import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserOrmEntity } from '../persistence/user.orm-entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: EntityRepository<UserOrmEntity>,
    private readonly em: EntityManager,
  ) {}

  create(user: UserOrmEntity): UserOrmEntity {
    this.em.persist(user);
    return user;
  }

  persist(user: UserOrmEntity): void {
    this.em.persist(user);
  }

  async findByEmail(email: string): Promise<UserOrmEntity | null> {
    return this.repo.findOne({ email });
  }
}
