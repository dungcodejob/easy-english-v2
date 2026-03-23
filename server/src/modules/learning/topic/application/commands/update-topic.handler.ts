import { EntityManager } from '@mikro-orm/postgresql';
import { Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import {
  InjectTopicRepository,
  type ITopicRepository,
} from '../../domain/repositories/topic.repository.interface';
import { TopicMapper } from '../../infrastructure/mappers/topic.mapper';
import { TopicDto } from '../../dto/responses/topic.dto';
import { UpdateTopicCommand } from './update-topic.command';

/**
 * Update Topic Command Handler
 *
 * Business logic layer - handles the update topic use case.
 * Validates ownership before updating (multi-tenant safety).
 */
@CommandHandler(UpdateTopicCommand)
export class UpdateTopicHandler implements ICommandHandler<
  UpdateTopicCommand,
  TopicDto
> {
  private readonly logger = new Logger(UpdateTopicHandler.name);

  constructor(
    private readonly em: EntityManager,
    @InjectTopicRepository()
    private readonly repo: ITopicRepository,
    private readonly mapper: TopicMapper,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateTopicCommand): Promise<TopicDto> {
    const topic = await this.repo.findById(
      command.topicId,
      command.tenantId,
      command.userId,
    );

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    topic.update({
      name: command.name,
      description: command.description,
    });

    this.repo.persist(topic);
    await this.em.flush();
    topic.publishEvents(this.logger, this.eventBus);

    return this.mapper.toResponse(topic) as TopicDto;
  }
}
