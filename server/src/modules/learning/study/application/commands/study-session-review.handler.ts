import { EntityManager } from '@mikro-orm/postgresql';
import {
  BadRequestException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ReviewWordCommand } from 'src/modules/learning/progress/application/commands/review-word.command';
import {
  ReviewWordResponse,
} from 'src/modules/learning/progress/application/commands/review-word.handler';
import { StudySessionRepository } from '../../infrastructure/repositories/study-session.repository';
import { StudySessionReviewCommand } from './study-session-review.command';

@CommandHandler(StudySessionReviewCommand)
export class StudySessionReviewHandler
  implements ICommandHandler<StudySessionReviewCommand, ReviewWordResponse>
{
  private readonly logger = new Logger(StudySessionReviewHandler.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly sessionRepository: StudySessionRepository,
    private readonly em: EntityManager,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: StudySessionReviewCommand): Promise<ReviewWordResponse> {
    const session = await this.sessionRepository.findSessionById(command.sessionId);

    if (!session) {
      throw new NotFoundException('Study session not found');
    }

    if (session.userId !== command.userId || session.tenantId !== command.tenantId) {
      throw new NotFoundException('Study session not found');
    }

    if (!session.isInProgress) {
      throw new BadRequestException('Study session is not in progress');
    }

    if (!session.includesCard(command.wordSenseId)) {
      throw new BadRequestException('Word is not enrolled in this study session');
    }

    const existingLog = await this.em.findOne('StudyReviewLogOrmEntity', {
      session: this.em.getReference('StudySessionOrmEntity', command.sessionId),
      wordSense: this.em.getReference('WordSenseOrmEntity', command.wordSenseId),
    });

    if (existingLog) {
      throw new ConflictException('Card has already been reviewed in this session');
    }

    const reviewResult = await this.commandBus.execute<ReviewWordCommand, ReviewWordResponse>(
      new ReviewWordCommand(
        command.userId,
        command.wordSenseId,
        command.rating,
        command.reviewDurationMs,
        command.sessionId,
      ),
    );

    session.recordReview(command.rating);
    await this.sessionRepository.saveSession(session);
    await this.em.flush();
    session.publishEvents(this.logger, this.eventBus);

    return reviewResult;
  }
}
