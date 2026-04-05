import { BadRequestException, Logger } from '@nestjs/common';
import {
  CommandHandler,
  EventBus,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';

import { EntityManager } from '@mikro-orm/postgresql';

import { StartStudySessionCommand } from './start-study-session.command';
import {
  StudySession,
  studySessionScope,
  studySessionType,
} from '../../domain/entities/study-session.entity';
import { QuizCardDto } from '../../dto/responses/quiz-card.response.dto';
import {
  StudyCardResponseDto,
  StudyCardsEnvelopeDto,
  TopicStudyCardsEnvelopeDto,
} from '../../dto/responses/study-card.response.dto';
import { StudySessionRepository } from '../../infrastructure/repositories/study-session.repository';
import { GetDueCardsQuery } from '../queries/get-due-cards.query';
import { GetQuizCardsQuery } from '../queries/get-quiz-cards.query';
import { GetTopicCardsQuery } from '../queries/get-topic-cards.query';

export type StartStudySessionResponse =
  | {
      sessionId: string;
      cards: StudyCardResponseDto[];
      total: number;
      capped: boolean;
    }
  | { sessionId: string; cards: QuizCardDto[]; total: number; capped: boolean };

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
    if (command.scope === studySessionScope.Topic && !command.topicId) {
      throw new BadRequestException('topicId is required for TOPIC scope');
    }

    // Determine card type based on studyType
    let cards: StudyCardResponseDto[] | QuizCardDto[];
    let capped = false;

    if (command.scope === studySessionScope.Topic) {
      const cardsEnvelope = await this.queryBus.execute<
        GetTopicCardsQuery,
        TopicStudyCardsEnvelopeDto
      >(
        new GetTopicCardsQuery(
          command.userId,
          command.tenantId,
          command.topicId!,
        ),
      );

      cards = cardsEnvelope.cards;
      capped = cardsEnvelope.capped;
    } else if (command.studyType === studySessionType.Quiz) {
      const quizCards = await this.queryBus.execute<
        GetQuizCardsQuery,
        QuizCardDto[]
      >(new GetQuizCardsQuery(command.userId, command.tenantId));

      cards = quizCards;
      capped = false; // GetQuizCardsHandler already caps at 20
    } else {
      const cardsEnvelope = await this.queryBus.execute<
        GetDueCardsQuery,
        StudyCardsEnvelopeDto
      >(new GetDueCardsQuery(command.userId, command.tenantId));

      cards = cardsEnvelope.cards;
      capped = cardsEnvelope.capped;
    }

    const session = StudySession.create({
      userId: command.userId,
      tenantId: command.tenantId,
      scope: command.scope,
      studyType: command.studyType,
      topicId:
        command.scope === studySessionScope.Topic ? command.topicId! : null,
      enrolledCardIds: cards.map((card) => card.wordSenseId) as string[],
    });

    await this.sessionRepository.saveSession(session);
    await this.em.flush();
    session.publishEvents(this.logger, this.eventBus);

    if (command.studyType === studySessionType.Quiz) {
      return {
        sessionId: session.id,
        cards: cards as QuizCardDto[],
        total: cards.length,
        capped,
      } as StartStudySessionResponse;
    } else {
      return {
        sessionId: session.id,
        cards: cards as StudyCardResponseDto[],
        total: cards.length,
        capped,
      } as StartStudySessionResponse;
    }
  }
}
