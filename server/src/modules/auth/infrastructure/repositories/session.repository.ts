import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { Session, SessionStatus } from '../../domain/entities/session.entity';
import { ISessionRepository } from '../../domain/repositories/session.repository.interface';
import { SessionMapper } from '../mappers/session.mapper';
import { SessionOrmEntity } from '../persistence/session.orm-entity';

@Injectable()
export class SessionRepository implements ISessionRepository {
  constructor(
    @InjectRepository(SessionOrmEntity)
    private readonly repo: EntityRepository<SessionOrmEntity>,
    private readonly mapper: SessionMapper,
  ) {}

  persist(session: Session): void {
    const ormEntity = this.mapper.toPersistence(session);
    this.repo.getEntityManager().persist(ormEntity);
  }

  async findActiveByUserId(userId: string): Promise<Session[]> {
    const records = await this.repo.find(
      {
        user: { id: userId },
        status: SessionStatus.ACTIVE,
      },
      {
        populate: ['tenant', 'user', 'authIdentity'],
      },
    );
    return records.map((record) => this.mapper.toDomain(record));
  }

  async countActiveByUserId(userId: string): Promise<number> {
    return this.repo.count({
      user: { id: userId },
      status: SessionStatus.ACTIVE,
    });
  }

  async findById(id: string): Promise<Session | null> {
    const entity = await this.repo.findOne({ id });
    return entity ? this.mapper.toDomain(entity) : null;
  }
}
