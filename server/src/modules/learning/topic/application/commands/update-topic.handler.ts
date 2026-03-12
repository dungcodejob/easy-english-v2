import { CreateRequestContext, MikroORM } from '@mikro-orm/core';
import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TopicEntity } from '../../infrastructure/persistence/topic.orm-entity';
import { UpdateTopicCommand } from './update-topic.command';

@CommandHandler(UpdateTopicCommand)
export class UpdateTopicHandler implements ICommandHandler<UpdateTopicCommand> {
  constructor(private readonly orm: MikroORM) {}

  @CreateRequestContext()
  async execute(command: UpdateTopicCommand): Promise<TopicEntity> {
    const em = this.orm.em;

    const topic = await em.findOne(TopicEntity, {
      id: command.topicId,
      tenantId: command.tenantId,
      userId: command.userId,
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    topic.name = command.name;
    topic.description = command.description;

    await em.persistAndFlush(topic);

    return topic;
  }
}
