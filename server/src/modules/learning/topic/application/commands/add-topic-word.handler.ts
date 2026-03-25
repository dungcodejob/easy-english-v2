import { EntityManager } from '@mikro-orm/postgresql';
import {
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { TopicWordOrmEntity } from '../../infrastructure/persistence/topic-word.orm-entity';
import {
  InjectTopicRepository,
  type ITopicRepository,
} from '../../domain/repositories/topic.repository.interface';
import { TopicWordDto } from '../../dto/responses/topic.dto';
import { AddTopicWordCommand } from './add-topic-word.command';

/**
 * Add Topic Word Command Handler
 *
 * Business logic layer - handles adding a word to a topic.
 * Enforces the 200-word per topic limit and duplicate detection via domain logic.
 */
@CommandHandler(AddTopicWordCommand)
export class AddTopicWordHandler implements ICommandHandler<
  AddTopicWordCommand,
  TopicWordDto
> {
  private readonly logger = new Logger(AddTopicWordHandler.name);

  constructor(
    private readonly em: EntityManager,
    @InjectTopicRepository()
    private readonly repo: ITopicRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: AddTopicWordCommand): Promise<TopicWordDto> {
    const topic = await this.repo.findById(
      command.topicId,
      command.tenantId,
      command.userId,
    );

    if (!topic) {
      throw new NotFoundException('Topic not found or access denied');
    }

    const existingWordCount = await this.em.count(TopicWordOrmEntity, {
      topic: { id: command.topicId },
    });

    const result = topic.addWord(command.wordSenseId, existingWordCount);

    if (result.isErr()) {
      if (result.error === 'duplicate') {
        throw new ConflictException('Word is already in this topic');
      }
      if (result.error === 'limit_reached') {
        throw new BadRequestException(
          'Topic has reached the maximum limit of 200 words.',
        );
      }
      throw new Error('Unexpected error adding word to topic');
    }

    const topicWord = result.value.topicWord;

    this.repo.persist(topic);
    await this.em.flush();
    topic.publishEvents(this.logger, this.eventBus);

    return {
      id: topicWord.id,
      topicId: command.topicId,
      wordSenseId: topicWord.wordSenseId,
      // Status is derived from UserWordSenseProgress at read time.
      // A freshly added word has no progress record yet — status is 'NEW'.
      status: 'NEW' as const,
      addedAt: topicWord.addedAt,
    };
  }
}
