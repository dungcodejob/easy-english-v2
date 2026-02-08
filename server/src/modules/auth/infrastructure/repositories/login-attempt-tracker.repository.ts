import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { LoginAttemptTracker } from '../../domain/entities/login-attempt-tracker.entity';
import { ILoginAttemptTrackerRepository } from '../../domain/repositories/login-attempt-tracker.repository.interface';
import { LoginAttemptTrackerMapper } from '../mappers/login-attempt-tracker.mapper';
import { LoginAttemptTrackerOrmEntity } from '../persistence/login-attempt-tracker.orm-entity';

@Injectable()
export class LoginAttemptTrackerRepository implements ILoginAttemptTrackerRepository {
  constructor(
    @InjectRepository(LoginAttemptTrackerOrmEntity)
    private readonly repo: EntityRepository<LoginAttemptTrackerOrmEntity>,
    private readonly mapper: LoginAttemptTrackerMapper,
  ) {}

  persist(tracker: LoginAttemptTracker): void {
    const ormEntity = this.mapper.toPersistence(tracker);
    this.repo.getEntityManager().persist(ormEntity);
  }

  async findByIdentifier(
    tenantId: string,
    identifier: string,
    identifierType: string,
  ): Promise<LoginAttemptTracker | null> {
    const record = await this.repo.findOne(
      {
        tenant: { id: tenantId },
        identifier,
        identifierType,
      },
      {
        populate: ['tenant'],
      },
    );
    return record ? this.mapper.toDomain(record) : null;
  }
}
