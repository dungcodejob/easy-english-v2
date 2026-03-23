import { Logger } from '@nestjs/common';
import { EventsHandler } from '@nestjs/cqrs';
import { WorkspaceCreatedEvent } from '../../../workspace/domain/events';
import type { IStudyStatsRepository } from '../repositories/study-stats.repository.interface';
import { StudyStats } from '../entities/study-stats.aggregate';

/**
 * StudyStats Initializer Handler - Domain Event Listener
 *
 * Creates StudyStats when a new workspace is created.
 * This ensures every user has stats initialized when they sign up.
 */
@EventsHandler(WorkspaceCreatedEvent)
export class StudyStatsInitializerHandler {
  private readonly logger = new Logger(StudyStatsInitializerHandler.name);

  constructor(private readonly statsRepo: IStudyStatsRepository) {}

  async handle(event: WorkspaceCreatedEvent): Promise<void> {
    this.logger.debug(
      `Initializing StudyStats for tenant ${event.tenantId}, user ${event.userId}`,
    );

    const stats = StudyStats.create(event.tenantId, event.userId);
    await this.statsRepo.persist(stats);

    this.logger.log(`StudyStats initialized for user ${event.userId}`);
  }
}
