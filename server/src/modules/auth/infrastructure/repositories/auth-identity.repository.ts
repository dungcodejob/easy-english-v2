import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { AuthIdentity } from '../../domain/entities';
import { IAuthIdentityRepository } from '../../domain/repositories/auth-identity.repository.interface';
import { AuthIdentityMapper } from '../mappers/auth-identity.mapper';
import { AuthIdentityOrmEntity } from '../persistence/auth-identity.orm-entity';

@Injectable()
export class AuthIdentityRepository implements IAuthIdentityRepository {
  constructor(
    @InjectRepository(AuthIdentityOrmEntity)
    private readonly repo: EntityRepository<AuthIdentityOrmEntity>,
    private readonly em: EntityManager,
    private readonly mapper: AuthIdentityMapper,
  ) {}

  persist(identity: AuthIdentity): void {
    const ormEntity = this.mapper.toPersistence(identity);
    this.em.persist(ormEntity);
  }

  async findByProviderAndProviderUserId(
    provider: string,
    providerUserId: string,
  ): Promise<AuthIdentity | null> {
    const ormEntity = await this.repo.findOne({ provider, providerUserId });
    return ormEntity ? this.mapper.toDomain(ormEntity) : null;
  }
}
