import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Session } from '../../domain/entities/session.entity';
import { ISessionRepository } from '../../domain/repositories/session.repository.interface';
import { SessionMikroEntity } from '../persistence/session.mikro-entity';
import { UserMikroEntity } from '../persistence/user.mikro-entity';

@Injectable()
export class SessionRepository implements ISessionRepository {
  constructor(
    @InjectRepository(SessionMikroEntity)
    private readonly repo: EntityRepository<SessionMikroEntity>,
  ) {}

  async create(session: Session): Promise<void> {
    const entity = this.repo.create({
      id: session.id,
      user: this.repo
        .getEntityManager()
        .getReference(UserMikroEntity, session.userId),
      refreshTokenHash: session.refreshTokenHash,
      identifier: session.identifier,
      userIp: session.userIp,
      lastActivityAt: session.lastActivityAt,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt,
      createdAt: session.createdAt,
      deletedAt: session.deletedAt,
    });
    await this.repo.getEntityManager().persistAndFlush(entity);
  }

  async update(session: Session): Promise<void> {
    const entity = await this.repo.findOne({ id: session.id });
    if (entity) {
      entity.refreshTokenHash = session.refreshTokenHash;
      entity.lastActivityAt = session.lastActivityAt;
      entity.expiresAt = session.expiresAt;
      entity.revokedAt = session.revokedAt;
      entity.deletedAt = session.deletedAt;
      await this.repo.getEntityManager().flush();
    }
  }

  async findById(id: string): Promise<Session | null> {
    const entity = await this.repo.findOne({ id, deletedAt: null });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async findAllByUserId(userId: string): Promise<Session[]> {
    const entities = await this.repo.find({ user: userId, deletedAt: null });
    return entities.map((e) => this.toDomain(e));
  }

  async delete(id: string): Promise<void> {
    // Soft delete usually, but method name is delete.
    // Spec says "Sessions are soft-deleted after 30 days" & "Revoked".
    // "Delete" usually implies hard delete or soft delete depending on implementation.
    // I will set deletedAt.
    const entity = await this.repo.findOne({ id });
    if (entity) {
      entity.deletedAt = new Date();
      await this.repo.getEntityManager().flush();
    }
  }

  async deleteByUserId(userId: string): Promise<void> {
    // Revoke/Delete all
    const entities = await this.repo.find({ user: userId, deletedAt: null });
    for (const e of entities) {
      e.deletedAt = new Date();
    }
    await this.repo.getEntityManager().flush();
  }

  private toDomain(entity: SessionMikroEntity): Session {
    return new Session({
      id: entity.id,
      userId: entity.user.id,
      refreshTokenHash: entity.refreshTokenHash,
      identifier: entity.identifier,
      userIp: entity.userIp,
      lastActivityAt: entity.lastActivityAt,
      expiresAt: entity.expiresAt,
      revokedAt: entity.revokedAt,
      createdAt: entity.createdAt,
      deletedAt: entity.deletedAt,
    });
  }
}
