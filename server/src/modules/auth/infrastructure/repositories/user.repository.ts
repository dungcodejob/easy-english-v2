import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';

import { User } from '../../domain/entities';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserMapper } from '../mappers/user.mapper';
import { UserOrmEntity } from '../persistence/user.orm-entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: EntityRepository<UserOrmEntity>,
    private readonly em: EntityManager,
    private readonly mapper: UserMapper,
  ) {}

  persist(user: User): void {
    const ormEntity = this.mapper.toPersistence(user);

    this.em.persist(ormEntity);
  }

  async findByEmail(email: string): Promise<User | null> {
    const ormEntity = await this.repo.findOne({ email });

    return ormEntity ? this.mapper.toDomain(ormEntity) : null;
  }
}
