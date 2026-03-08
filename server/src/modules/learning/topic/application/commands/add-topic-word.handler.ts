import { CreateRequestContext, MikroORM } from '@mikro-orm/core';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TopicWordEntity } from '../../infrastructure/persistence/topic-word.orm-entity';
import { TopicEntity } from '../../infrastructure/persistence/topic.orm-entity';
import { AddTopicWordCommand } from './add-topic-word.command';

@CommandHandler(AddTopicWordCommand)
export class AddTopicWordHandler implements ICommandHandler<AddTopicWordCommand> {
  constructor(private readonly orm: MikroORM) {}

  @CreateRequestContext()
  async execute(command: AddTopicWordCommand): Promise<TopicWordEntity> {
    const em = this.orm.em;

    // 1. Verify topic exists and belongs to user
    const topic = await em.findOne(TopicEntity, {
      id: command.topicId,
      tenantId: command.tenantId,
      userId: command.userId,
    });

    if (!topic) {
      throw new NotFoundException('Topic not found or access denied');
    }

    // 2. Check limits (max 200 words per topic)
    const wordCount = await em.count(TopicWordEntity, {
      topic: topic.id,
    });

    if (wordCount >= 200) {
      throw new BadRequestException(
        'Topic has reached the maximum limit of 200 words.',
      );
    }

    // 3. Check for duplicates
    const existingWord = await em.findOne(TopicWordEntity, {
      topic: topic.id,
      wordSenseId: command.wordSenseId,
    });

    if (existingWord) {
      throw new BadRequestException('Word is already in this topic');
    }

    // 4. Create topic word
    const topicWord = new TopicWordEntity(topic, command.wordSenseId);

    await em.persistAndFlush(topicWord);

    return topicWord;
  }
}
