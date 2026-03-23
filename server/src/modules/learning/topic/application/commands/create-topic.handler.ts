import { EntityManager } from '@mikro-orm/postgresql';
import { Logger, BadRequestException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Topic } from '../../domain/entities/topic.aggregate';
import {
  InjectTopicRepository,
  type ITopicRepository,
} from '../../domain/repositories/topic.repository.interface';
import { TopicMapper } from '../../infrastructure/mappers/topic.mapper';
import { TopicDto } from '../../dto/responses/topic.dto';
import { CreateTopicCommand } from './create-topic.command';

/**
 * Create Topic Command Handler
 *
 * Business logic layer - handles the create topic use case.
 * Enforces the 50-topic per user limit via domain logic.
 */
@CommandHandler(CreateTopicCommand)
export class CreateTopicHandler implements ICommandHandler<
  CreateTopicCommand,
  TopicDto
> {
  private readonly logger = new Logger(CreateTopicHandler.name);

  constructor(
    private readonly em: EntityManager,
    @InjectTopicRepository()
    private readonly repo: ITopicRepository,
    private readonly mapper: TopicMapper,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateTopicCommand): Promise<TopicDto> {
    // Check existing topic count to enforce the 50-topic limit
    const { count } = await this.repo.findByUser(
      command.tenantId,
      command.userId,
      1,
      0,
    );

    const result = Topic.create(
      {
        tenantId: command.tenantId,
        userId: command.userId,
        name: command.name,
        description: command.description,
      },
      count,
    );

    if (result.isErr()) {
      throw new BadRequestException(
        'User has reached the maximum limit of 50 topics.',
      );
    }

    const topic = result.value;

    this.repo.persist(topic);
    await this.em.flush();
    topic.publishEvents(this.logger, this.eventBus);

    return this.mapper.toResponse(topic) as TopicDto;
  }
}
