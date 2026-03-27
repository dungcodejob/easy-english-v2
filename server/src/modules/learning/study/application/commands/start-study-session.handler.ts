import { BadRequestException, Logger } from '@nestjs/common';
import {
  CommandHandler,
  EventBus,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';

import { EntityManager } from '@mikro-orm/postgresql';

import { StartStudySessionCommand } from './start-study-session.command';
import { StudySession } from '../../domain/entities/study-session.entity';
import {
  StudyCardResponseDto,
  StudyCardsEnvelopeDto,
  TopicStudyCardsEnvelopeDto,
} from '../../dto/responses/study-card.response.dto';
import { StudySessionRepository } from '../../infrastructure/repositories/study-session.repository';
import { GetDueCardsQuery } from '../queries/get-due-cards.query';
import { GetTopicCardsQuery } from '../queries/get-topic-cards.query';

export interface StartStudySessionResponse {
  sessionId: string;
  cards: StudyCardResponseDto[];
  total: number;
  capped: boolean;
}

@CommandHandler(StartStudySessionCommand)
export class StartStudySessionHandler implements ICommandHandler<
  StartStudySessionCommand,
  StartStudySessionResponse
> {
  private readonly logger = new Logger(StartStudySessionHandler.name);

  constructor(
    private readonly queryBus: QueryBus,
    private readonly sessionRepository: StudySessionRepository,
    private readonly em: EntityManager,
    private readonly eventBus: EventBus,
  ) {}

  async execute(
    command: StartStudySessionCommand,
  ): Promise<StartStudySessionResponse> {
    if (command.scope === 'TOPIC' && !command.topicId) {
      throw new BadRequestException('topicId is required for TOPIC scope');
    }

    let cardsEnvelope: StudyCardsEnvelopeDto | TopicStudyCardsEnvelopeDto;

    if (command.scope === 'TOPIC') {
      cardsEnvelope = await this.queryBus.execute<
        GetTopicCardsQuery,
        TopicStudyCardsEnvelopeDto
      >(
        new GetTopicCardsQuery(
          command.userId,
          command.tenantId,
          command.topicId!,
        ),
      );
    } else {
      cardsEnvelope = await this.queryBus.execute<
        GetDueCardsQuery,
        StudyCardsEnvelopeDto
      >(new GetDueCardsQuery(command.userId, command.tenantId));
    }

    const session = StudySession.create({
      userId: command.userId,
      tenantId: command.tenantId,
      scope: command.scope,
      topicId: command.scope === 'TOPIC' ? command.topicId! : null,
      enrolledCardIds: cardsEnvelope.cards.map((card) => card.wordSenseId),
    });

    await this.sessionRepository.saveSession(session);
    await this.em.flush();
    session.publishEvents(this.logger, this.eventBus);

    return {
      sessionId: session.id,
      cards: cardsEnvelope.cards,
      total: cardsEnvelope.total,
      capped: cardsEnvelope.capped,
    };
  }
}
