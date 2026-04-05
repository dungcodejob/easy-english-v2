import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { EntityManager } from '@mikro-orm/postgresql';

import { CompleteStudySessionCommand } from './complete-study-session.command';
import { StudySessionRepository } from '../../infrastructure/repositories/study-session.repository';

export interface CompleteStudySessionResponse {
  sessionId: string;
  status: 'COMPLETED';
  completedAt: string;
}

@CommandHandler(CompleteStudySessionCommand)
export class CompleteStudySessionHandler implements ICommandHandler<
  CompleteStudySessionCommand,
  CompleteStudySessionResponse
> {
  private readonly logger = new Logger(CompleteStudySessionHandler.name);

  constructor(
    private readonly sessionRepository: StudySessionRepository,
    private readonly em: EntityManager,
    private readonly eventBus: EventBus,
  ) {}

  async execute(
    command: CompleteStudySessionCommand,
  ): Promise<CompleteStudySessionResponse> {
    const session = await this.sessionRepository.findSessionById(
      command.sessionId,
    );

    if (!session) {
      throw new NotFoundException('Study session not found');
    }

    if (
      session.userId !== command.userId ||
      session.tenantId !== command.tenantId
    ) {
      throw new NotFoundException('Study session not found');
    }

    if (!session.isInProgress) {
      throw new BadRequestException('Study session is not in progress');
    }

    session.complete();

    await this.sessionRepository.saveSession(session);
    await this.em.flush();
    session.publishEvents(this.logger, this.eventBus);

    return {
      sessionId: session.id,
      status: 'COMPLETED',
      completedAt:
        session.completedAt?.toISOString() ?? new Date().toISOString(),
    };
  }
}
