import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { IAuthIdentityRepository } from '../../domain/repositories/auth-identity.repository.interface';
import { AuthIdentityOrmEntity } from '../persistence/auth-identity.orm-entity';

@Injectable()
export class AuthIdentityRepository implements IAuthIdentityRepository {
  constructor(
    @InjectRepository(AuthIdentityOrmEntity)
    private readonly repo: EntityRepository<AuthIdentityOrmEntity>,
    private readonly em: EntityManager,
  ) {}

  create(identity: AuthIdentityOrmEntity): AuthIdentityOrmEntity {
    this.em.persist(identity);
    return identity;
  }

  persist(identity: AuthIdentityOrmEntity): void {
    this.em.persist(identity);
  }

  async findByProviderAndUserId(
    provider: string,
    providerUserId: string,
  ): Promise<AuthIdentityOrmEntity | null> {
    return this.repo.findOne({ provider, providerUserId });
  }
}
