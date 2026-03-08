import { CreateRequestContext, MikroORM } from '@mikro-orm/core';
import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TopicWordEntity } from '../../infrastructure/persistence/topic-word.orm-entity';
import { TopicEntity } from '../../infrastructure/persistence/topic.orm-entity';
import { RemoveTopicWordCommand } from './remove-topic-word.command';

@CommandHandler(RemoveTopicWordCommand)
export class RemoveTopicWordHandler implements ICommandHandler<RemoveTopicWordCommand> {
  constructor(private readonly orm: MikroORM) {}

  @CreateRequestContext()
  async execute(command: RemoveTopicWordCommand): Promise<void> {
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

    // 2. Find the word in the topic
    const topicWord = await em.findOne(TopicWordEntity, {
      topic: topic.id,
      wordSenseId: command.wordSenseId,
    });

    if (!topicWord) {
      throw new NotFoundException('Word not found in this topic');
    }

    // 3. Remove topic word
    await em.removeAndFlush(topicWord);
  }
}
